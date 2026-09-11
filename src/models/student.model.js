const { required } = require("joi")
const mongoose = require(`mongoose`)


const registerSchema = mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetPasswordToken : {
        type : String
    },
    resetPasswordExpiry : {
        type : Date
    }
})

const registerModel = mongoose.model("students", registerSchema)




module.exports = registerModel