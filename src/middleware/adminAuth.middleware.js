const jwt = require(`jsonwebtoken`)
const adminModel = require("../models/admin.model")
async function adminAuth(req, res, next){

    //Admin authorization
    try{

        const token = req.cookies["Admin-Login-token"]
        if(!token){
            return res.status(401).json({
                message : "Unauthorized"
            })
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.admin = decoded

        //Admn still ative or not
        const admin = await adminModel.findById(decoded.id)
        if(!admin){
            return res.status(401).json({
                message : "Unauthorized"
            })
        }
        next()


    } catch (error){
        return res.status(401).json({
            message : error.message
        })
    }

    
}

module.exports = {adminAuth}