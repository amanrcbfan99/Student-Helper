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

async function getPyq(req, res){

    console.log("GET PYQ CONTROLLER HIT")
    try{
    
    const limit = req.query.limit || 10
    const skip = req.query.skip || 0
    const search = req.query.search
    
    let result;
    if(!search){
        result = await pyqModel.find()
        
        .limit(limit)
        .skip(skip)
    }

    else {result = await pyqModel.find({

        $or : [
            {semester : {
            $regex : search,
            $options : "i"
            }},
            
            {subject : {
            $regex : search,
            $options : "i"
            }},

            {title : {
            $regex : search,
            $options : "i"
            }}

        ]

    })
        
        .limit(limit)
        .skip(skip)}


    

    if(result.length < 1){

        return res.status(404).json({
            message : "No matching resources found"
        })

    }

    res.status(200).json({
        message : "Resources fetched successfully",
        result
    })}
    catch(error){
        res.status(500).json({
            error
        })
    }

}
module.exports = {uploadPyq, getPyq}


