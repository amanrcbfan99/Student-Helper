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

try{ //Fetching Token
    const token = req.cookies["login-token"]

    if(!token){
        return res.status(401).json({
            message : "Signup first"
        })
    }

    //Token Validation
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)

    //suspended or not
    const user = await studentModel.findById(decoded.id)
    if(!user){
        return res.status(404).json({
            message : "User Not Found"
        })
    }
    if(user.isSuspended === true){
        return res.status(403).json({
            message : "Your account is temporary suspend due to some reason, Please contact support to activate."
        })
    }
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