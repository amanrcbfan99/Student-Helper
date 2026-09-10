const registerModel = require(`../models/student.model`)
const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcrypt`)


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
        user
    })
}

module.exports = {register}