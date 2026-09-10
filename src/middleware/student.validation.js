const Joi = require("joi")

const registerSchema = Joi.object({
    email : 
        Joi.string()
        .email()
        .required()
    ,

    username : Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    ,
    password : Joi.string()
    .min(6)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[a-z]/)
    .pattern(/[^A-Za-z0-9]/)
    .required()
    
})

function registerValidation(req, res, next){

    const {error} = registerSchema.validate(req.body)
if(error){
    return res.status(400).json({
        message: "Your input formate is not valid"
    })

    }

    next()

}


const loginSchema = Joi.object({
    identifier : Joi.string()
    .required()

    ,

    password : Joi.string()
    .required()
})


function loginValidation(req, res, next){
    const {error} = loginSchema.validate(req.body)

    if(error){
        return res.status(400).json({
            message: "Invalid Credentials"
        })
    }

    next()
}


module.exports = {registerValidation, loginValidation}