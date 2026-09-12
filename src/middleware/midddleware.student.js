const jsonwebtoken = require(`jsonwebtoken`)
const registerModel = require(`../models/student.model`)


async function userAuth(req, res, next){
    
    const {identifier} = req.body

    const user = await registerModel.findOne({
        $or : [
            { email: identifier },
            { username: identifier }
        ]
    })

    if(!user){
            return res.status(409).json({
            message : "User does't exists"
        })
    }
    req.user = user
    next()
}

async function  loggedInorNot(req, res, next){
    const token = req.cookies["login-token"]

    if(!token){
        res.status(409).json({
            message : "Signup first"
        })
    }

    const decoded = await jsonwebtoken.verify(token, process.env.JWT_SECRET)
    if(!decoded){
        return res.status(401).json({
            message : "Unauthorized Token"
        })
    }

    req.user = decoded

    next()
}

module.exports = {userAuth, loggedInorNot}