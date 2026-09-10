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
    }
})


const registerModel = mongoose.model("students", registerSchema)

module.exports = registerModel