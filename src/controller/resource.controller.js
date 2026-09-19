const { pyqModel } = require(`../models/resource.model`)
const ImageKit = require("@imagekit/nodejs")

async function uploadPyq(req, res){

    try{

    const {title,subject, semester, type, isPremium} = req.body
    const file = req.file

    //imagekit initilization
    const client = new ImageKit({
        privateKey : process.env.IMAGEKIT_PRIVATE_KEY
    })
    
    //upload
    const result = await client.files.upload({
    file : file.buffer.toString("base64"),
    fileName : file.originalname
})

    const fileUrl = result.url

    const pyq = await pyqModel.create({
        title,
        subject,
        semester,
        type,
        isPremium,
        fileUrl
    })

    res.status(201).json({
        message : "File uploaded successfully"
    })
    } catch(error){
    console.log("IMAGEKIT ERROR:", error)

    res.status(500).json({
        message: error.message,
        name: error.name,
        stack: error.stack
    })
}

}

module.exports = {uploadPyq}