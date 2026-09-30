const registerModel = require(`../models/student.model`)
const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcrypt`)
const validation = require(`../middleware/student.validation`)
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const ImageKit = require("@imagekit/nodejs")
const reportModel = require(`../models/report.model`)
const bookModel = require(`../models/book.model`)

async function register(req, res){

    const {email, username, password} = req.body

    const emailAlreadyregistered = await registerModel.findOne({
        email
    })

    const usernameAlreadyTaken = await registerModel.findOne({
        username
    })


    if(emailAlreadyregistered){
        return res.status(409).json({
            message : "Email already registedred"
        })
    }

    if(usernameAlreadyTaken){
        return res.status(409).json({
            message : "Username already taken"
        })
    }

    const passwordhashing = await bcrypt.hash(password, 10)

    const user = await registerModel.create({
        email,
        username,
        password : passwordhashing
    })

    const token = jwt.sign({
        id : user._id
    }, process.env.JWT_SECRET)

    res.status(201).json({
        message : "User registered succussfully",
        userDetails : {
            email : user.email,
            username : user.username,
            id : user._id
        }
    })


}

async function login(req, res){

    const { password } = req.body
    const user = req.user

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if(!isPasswordValid){
        return res.status(401).json({
            message : "Wrong credentials entered"
        })
    }

    const token = jwt.sign({
        id : user._id
    }, process.env.JWT_SECRET)

    res.cookie("login-token", token)


    res.status(200).json({
        message :"Logged in successfully",
        user : user._id
    })


}

async function logout(req, res){
    
    const token = req.cookies["login-token"]

    if(!token){
        res.status(400).json({
            message : "You can't access this feature without logged in"
        })
    }

    res.clearCookie("login-token")
    
    res.status(200).json({
        message : "Logout Successfully"
    })

}


async function resetPassword(req, res){

    const {identifier} = req.body

    const user = await registerModel.findOne({
        $or : [
            {email : identifier}
            , {username : identifier}
        ]
    })

    if(!user){
        return res.status(400).json({
            message : "User not found"
        })
    }

    const temporarytoken = crypto.randomBytes(32).toString("hex")
    const resetLink = `http://localhost:3000/auth/resetPassword?token=${temporarytoken}`
    const hashToken = await crypto.createHash("sha256").update(temporarytoken).digest("hex")
    const expiry = new Date(Date.now() + 10 * 60 * 1000)


    user.resetPasswordToken = hashToken
    user.resetPasswordExpiry = expiry
    await user.save()
    

    const transporter = await nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY
    }
})

await transporter.sendMail({
    from : process.env.SENDER_EMAIL,
    to : user.email,
    subject : "Welcome",
    text : `Hello,

                We received a request to reset your Student Hub password.

                Click the link below to create a new password:

                ${resetLink}

                This link will expire in 10 minutes.

                If you did not request a password reset, you can safely ignore this email.

            Regards,
            Student Hub Team`
})
    //we have to create a token, hash it, send to the identifier.email, user will resent it, i have to compare my hashed token to users submitted token, if true user have to enter and confirt password, i have to hash it and save as password of ref of user
    res.status(200).json({
        message : "Reset link sent to your registered email"
    })
}

async function resetPasswordVerification(req, res){
    const {temporarytoken, newPassword} = req.body

    const hashToken = crypto.createHash("sha256").update(temporarytoken).digest("hex")
    const user = await registerModel.findOne({
        resetPasswordToken : hashToken,
        resetPasswordExpiry : {$gt: new Date()}
    })    


    if(!user){
        return res.status(400).json({
            message : "Invalid or expired reset token"
        })
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = newHashedPassword

    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined

    await user.save()

    res.status(200).json({
        message : "Password Reset successfully"
    })
}


async function changePassword(req, res){

    const {oldPassword, newPassword} = req.body
    const userId = req.user.id

    const user = await registerModel.findOne({
        _id : userId
    })

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)

    if(!isPasswordValid){
        return res.status(401).json({
            message : "Incorrect Password Entered"
        })
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashNewPassword
    await user.save()

    res.status(200).json({
        message : "Password changed successfully"
    })

}


async function getProfile(req, res){

    const userId = req.user.id
    const user = await registerModel.findOne({
        _id : userId
    })
    
    res.status(200).json({

        message : "Profile fetched successfully",
        user : {
            username : user.username,
            email : user.email,
        },
    })
}

async function updateProfile(req, res){

    const userId = req.user.id
    const {newUserName, password} = req.body

    const user = await registerModel.findById(userId)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(401).json({
            message : "Incorrect Password Entered"
        })
    }

    const usernameAvailOrNot = await registerModel.findOne({
        username : newUserName
    })

    if(usernameAvailOrNot){
        return res.status(400).json({
            message : "Username already taken"
        })
    }

    user.username = newUserName
    await user.save()

    res.status(201).json({
        message : "Username Changes Successfully"
    })
}

async function reportIssue(req, res) {

    try {

        const { Subject, Description, Category } = req.body
        const user = req.user

        let fileUrl = null

        if (req.file) {

            const client = new ImageKit({
                privateKey: process.env.IMAGEKIT_PRIVATE_KEY
            })

            const result = await client.files.upload({
                file: req.file.buffer.toString("base64"),
                fileName: req.file.originalname
            })

            fileUrl = result.url
        }

        const reportGenerate = await reportModel.create({
            user: user._id,
            Subject,
            Category,
            Description,
            fileUri: fileUrl
        })

        res.status(201).json({
            message: "Report submitted successfully",
            report: reportGenerate
        })

    } catch (error) {

        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

async function listOwnBook(req, res){

  try {
    
    const { bookName, printedPrice, sellingPrice, publication, bestFor} = req.body
    const user = req.user

    if(sellingPrice > printedPrice){
        return res.status(400).json({
            message : "Selling price should not be greater than printed price...!"
        })
    }

    if (printedPrice <= 0 || sellingPrice <= 0) {
    return res.status(400).json({
        message: "Price should be greater than 0"
    })
}

    if (!req.file) {
        return res.status(400).json({
            message: "Book image is required"
        })
    }
    let fileUrl = null

        if (req.file) {

            const client = new ImageKit({
                privateKey: process.env.IMAGEKIT_PRIVATE_KEY
            })

            const result = await client.files.upload({
                file: req.file.buffer.toString("base64"),
                fileName: req.file.originalname
            })

            fileUrl = result.url
        }


    const bookAlreadyListedBySameUser = await bookModel.findOne({
    bookName,
    seller: user._id
})


    if (bookAlreadyListedBySameUser) {
        return res.status(400).json({
            message: "You can't list the same book again"
        })
    }

    const listBook = await bookModel.create({
    bookName,
    printedPrice,
    sellingPrice,
    image: fileUrl,
    publication,
    bestFor,
    seller: user._id
})

    res.status(201).json({
        message : "book listed successfully"
    })

} catch(error){
    res.status(500).json({
    error: error.message
})
}

}

async function booksToSell(req, res){

    try{
    
    const limit = Number(req.query.limit) || 20
    const skip = Number(req.query.skip) || 0
    const search = req.query.search

    if(limit > 20){
        return res.status(400).json({
            message : "You cannot fetch more than 20 books in one time"
        })
    }

    const filter = {}
    
    if(!search){
    const allBooks = await bookModel
    .find()
    .limit(limit)
    .skip(skip)
        
    


    if(allBooks.length < 1){
        return res.status(404).json({
            message : "Books not found"
        })
    }

    res.status(200).json({
        message : "Books fetched successfully",
        Books : allBooks
    })}

    if(search){
        filter.$or = [
            {
                bookName : {
                    $regex : search,
                    $options : "i"
                } 
            },

            {
               publication : {
                    $regex : search,
                    $options : "i"
               } 
            },
            {
                bestFor : {
                    $regex : search,
                    $options : "i"
                }
            }
        ]


    const books = await bookModel
    .find(filter)
    .limit(limit)
    .skip(skip)

    if(books.length < 1){
        return res.status(404).json({
            message : "Books not found"
        })
    }

    res.status(200).json({
        message : "Books fetched successfully",
        Books : books
    })
}


} catch(error){
    res.status(500).json({
        message : error.message
    })
}
}
module.exports = {register, login, logout , resetPassword, resetPasswordVerification, changePassword, getProfile, updateProfile, reportIssue, listOwnBook, booksToSell}