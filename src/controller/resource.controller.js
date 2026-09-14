// const Resource = require("../models/resource.model")


// async function uploadResource(req, res) {

//     try {

//         const {
//             title,
//             description,
//             subject,
//             semester,
//             resourceType
//         } = req.body


//         if (!req.file) {

//             return res.status(400).json({
//                 message: "Resource file is required"
//             })
//         }


//         const resource = await Resource.create({

//             title,
//             description,
//             subject,
//             semester,
//             resourceType,

//             file: req.file.path,

//             uploadedBy: req.user.id
//         })


//         res.status(201).json({

//             message: "Resource uploaded successfully",

//             resource

//         })

//     } catch (error) {

//         res.status(500).json({

//             message: "Resource upload failed",

//             error: error.message

//         })
//     }
// }


// async function getResources(req, res) {

//     try {

//         const resources = await Resource.find()
//             .sort({
//                 createdAt: -1
//             })


//         res.status(200).json({

//             message: "Resources fetched successfully",

//             totalResources: resources.length,

//             resources

//         })

//     } catch (error) {

//         res.status(500).json({

//             message: "Failed to fetch resources",

//             error: error.message

//         })
//     }
// }


// module.exports = {
//     uploadResource,
//     getResources
// }



