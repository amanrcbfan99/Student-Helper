const { boolean } = require("joi")
const mongoose = require(`mongoose`)

const resourceSchema = new mongoose.Schema({
    title : String,
    subject : String,
    semseter : String,
    type : String,
    isPremium : boolean
})


const resourceModel = mongoose.model("resources", resourceSchema)

module.exports = resourceModel