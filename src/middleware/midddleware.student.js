const jsonwebtoken = require(`jsonwebtoken`)

async function userValidOrNot(req, res, next){
    
    const {username, email, password} = req.body

    $or : [username]
}