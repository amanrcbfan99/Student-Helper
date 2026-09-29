const mongoose = require(`mongoose`)

const bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },

    printedPrice: {
        type: Number,
        required: true
    },

    sellingPrice: {
        type: Number,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    publication: {
        type: String
    },

    bestFor: {
        type: String
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "students",
        required: true
    }
})

const bookModel = mongoose.model("books", bookSchema)

module.exports = bookModel