const jsonwebtoken = require(`jsonwebtoken`)
const registerModel = require(`../models/student.model`)


async function userAuth(req, res, next){
    
    const {identifier} = req.body

    const user = registerModel.findOne({
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

    next()
}

module.exports = {userAuth}