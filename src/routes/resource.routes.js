const express = require("express")

const router = express.Router()

const {
    uploadResource,
    getResources
} = require("../controllers/resource.controller")

const uploadResourceMiddleware =
    require("../middleware/resource.upload")


// IMPORTANT:
// Apne existing authentication middleware ka
// correct path aur middleware name yahan use karna.

const authMiddleware =
    require("../middleware/auth.middleware")



router.post(

    "/upload",

    authMiddleware,

    uploadResourceMiddleware.single("resource"),

    uploadResource
)


router.get(

    "/",

    getResources
)


module.exports = router