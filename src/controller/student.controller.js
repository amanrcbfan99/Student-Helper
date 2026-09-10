const registerModel = require(`../models/student.model`)
const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcrypt`)
const validation = require(`../middleware/student.validation`)

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

    const {identifier, password} = req.body


        const user = await registerModel.findOne({
        $or: [
        { username: identifier },
        { email: identifier }
    ]
        })

        if(!user){
            return res.status(409).json({
            message : "User does't exists"
        })
        }
        


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
module.exports = {register, login, logout}