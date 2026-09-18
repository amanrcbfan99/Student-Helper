const jsonwebtoken = require(`jsonwebtoken`)
const registerModel = require(`../models/student.model`)


async function userAuth(req, res, next){
    
    try{

    const {identifier} = req.body


    //Finding User
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


    //User Suspended or Not
    if(user.isSuspended === true){
        return res.status(403).json({
            message : "Your account is temporary suspend due to some reason, Please contact support to activate."
        })
    }
    req.user = user
    next()
    } 
    
    //Error Handling
    catch(error){
        res.status(500).json({
            error
        })
    }
    


    


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