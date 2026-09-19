const mongoose = require(`mongoose`)

const pyqSchema = new mongoose.Schema({
    title : String,
    subject : String,
    semester : String,
    type : String,
    fileUrl : String,
    isPremium : {
        type : Boolean,
        default : false
    }
})


const pyqModel = mongoose.model("pyq", pyqSchema)

module.exports = {pyqModel}