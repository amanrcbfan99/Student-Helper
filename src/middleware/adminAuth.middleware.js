const jwt = require(`jsonwebtoken`)

async function adminAuth(req, res, next){

    const token = req.cookies["Admin-Login-token"]

    if(!token){
        return res.status(409).json({
            message : "Unauthorized Access"
        })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if(!decoded){
        return res.status(409).json({
            message : "Invalid or expired token"
        })
    }
    
    req.admin = decoded

    next()
    
}