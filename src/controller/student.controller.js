const registerModel = require(`../models/student.model`)
const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcrypt`)
const validation = require(`../middleware/student.validation`)
const crypto = require("crypto")
const nodemailer = require("nodemailer")

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
module.exports = {register, login, logout , resetPassword, resetPasswordVerification, changePassword, getProfile, updateProfile}