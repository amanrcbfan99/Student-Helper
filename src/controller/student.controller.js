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

    const hashToken = await crypto.createHash("sha256").update(temporarytoken).digest("hex")
    const expiry = new Date(Date.now() + 10 * 60 * 1000)


    user.resetPasswordToken = hashToken
    user.resetPasswordExpiry = expiry
    await user.save()
    
    
    //we have to create a token, hash it, send to the identifier.email, user will resent it, i have to compare my hashed token to users submitted token, if true user have to enter and confirt password, i have to hash it and save as password of ref of user

}
module.exports = {register, login, logout , resetPassword }