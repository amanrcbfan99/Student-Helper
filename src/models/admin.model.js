const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    
    name :{
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    password :{
        type : String,
        required : true,
    },
    isActive :{
        type : boolean,

    },
    toFactorEnabled :{
        type : boolean,
    },
    timestamps :{
        
    }

})

const adminModel = mongoose.model("Admin", adminSchema)

module.exports = adminModel