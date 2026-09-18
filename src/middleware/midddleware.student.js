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

try{
    const token = req.cookies["login-token"]

    if(!token){
        return res.status(401).json({
            message : "Signup first"
        })
    }

    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
}
    catch(error){
        res.status(500).json({
            error
        })
    }

}

module.exports = {userAuth, loggedInorNot}