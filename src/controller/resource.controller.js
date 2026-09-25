const { resource } = require("../app")
const { findById } = require("../models/admin.model")
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

    try {

        const limit = req.query.limit || 10
        const skip = req.query.skip || 0

        const search = req.query.search
        const subject = req.query.subject
        const semester = req.query.semester
        const type = req.query.type
        const isPremium = req.query.isPremium

        let query = {}

        // Exact filters
        if(subject){
            query.subject = subject
        }

        if(semester){
            query.semester = semester
        }

        if(type){
            query.type = type
        }

        if(isPremium){
            query.isPremium = isPremium
        }

        // Search
        if(search){
            query.$or = [
                {
                    semester : {
                        $regex : search,
                        $options : "i"
                    }
                },
                {
                    subject : {
                        $regex : search,
                        $options : "i"
                    }
                },
                {
                    title : {
                        $regex : search,
                        $options : "i"
                    }
                }
            ]
        }

        const result = await pyqModel.find(query)
            .limit(limit)
            .skip(skip)

        if(result.length < 1){
            return res.status(404).json({
                message : "No matching resources found"
            })
        }

        res.status(200).json({
            message : "Resources fetched successfully",
            result
        })

    }
    catch(error){
        res.status(500).json({
            error
        })
    }
}

async function downloadPyq(req, res){

    try{

    const id = req.params.id
    const resource = await pyqModel.findById(id)

    if(!resource){
        return res.status(404).json({
            message : "Resource not found"
        })
    }

    res.redirect(resource.fileUrl)
    }

    catch(error){
    console.log(error)

    res.status(500).json({
        message: error.message
    })
}

        
}

async function saveResource(req, res){

    try{

        const user = req.user
        const resourceId = req.params.id
        const resource = await pyqModel.findById(resourceId)
        if(!resource){
            return res.status(404).json({
                message : "resource not found"
            })
        }

        if(user.savedResources.includes(resource._id)){
            return res.status(400).json({
                message : "Resource already saved"
            })
        }
        user.savedResources.push(resource._id)
        await user.save()

        res.status(200).json({
            message : "Resourve saved successfully"
        })

    } catch(error){
        res.status(500).json({
            error
        })
    }
}

async function addToFav(req, res){
    
    try{

    const user = req.user
    const id = req.params.id

    const resource = await pyqModel.findById(id)
    if(!resource){
        return res.status(404).json({
            message  : "Resource not found"
        })
    }

    if(user.favResource.includes(resource._id)){
        return res.status(409).json({
            message  : "Resource is already favourate"
        })
    }
    user.favResource.push(resource._id)
    await user.save()

    res.status(200).json({
        message : "Resource saved as favourate succussfully",
        favResources : user.favResource
    })



} catch(error){
    console.log(error)

    res.status(500).json({
        message: error.message
    })
}

}
module.exports = {uploadPyq, getPyq, downloadPyq, saveResource, addToFav}


