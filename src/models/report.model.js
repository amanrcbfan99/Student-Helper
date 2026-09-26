const mongoose = require (`mongoose`)

const reportSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "students",
        required : true
    },
    Subject : {
        type : String,
        required : true
    },
    Category : {
        type : String,
        enum: [
                "payment",
                "resource",
                "technical_issue",
                "support",
                "other"
            ],
        default : "other"

    },
    Description : {
        type : String,
        required : true
    },
    fileUri : {
        type : String,
    },
    status : {
        type  : String,
        enum : ["pending", "in_progress", "resolved", "rejected"],
        default : "pending"
    }
})


const reportModel = mongoose.model("reports", reportSchema)

module.exports = reportModel