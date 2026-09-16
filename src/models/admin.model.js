const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({

    name :{
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password :{
        type : String,
        required : true,
    },
    role : {
        type : String
    },
    isActive :{
        type : Boolean,

    },
    twoFactorEnabled :{
        type : Boolean,
    },
    failedAttempts  : {
        type : Number,
        default : 0
    }

}, {
    timestamps : true
})

const adminModel = mongoose.model("Admin", adminSchema)

module.exports = adminModel