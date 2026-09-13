const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/resources")
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9)

        const extension = path.extname(file.originalname)

        cb(null, uniqueName + extension)
    }
})


const fileFilter = function (req, file, cb) {

    const allowedTypes = [
        "application/pdf"
    ]

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true)

    } else {

        cb(new Error("Only PDF files are allowed"), false)
    }
}


const uploadResource = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

})


module.exports = uploadResource