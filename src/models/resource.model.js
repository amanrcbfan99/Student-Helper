const mongoose = require("mongoose")

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        semester: {
            type: Number,
            required: true
        },

        resourceType: {
            type: String,
            required: true,
            trim: true
        },

        file: {
            type: String,
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Resource = mongoose.model("Resource", resourceSchema)

module.exports = Resource