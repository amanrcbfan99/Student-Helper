const express = require(`express`)
const router = express.Router()
const studentController = require(`../controller/student.controller`)
const validation = require(`../middleware/student.validation`)
// const express = require(`express`)
// const router = express.Router()

router.post(`/register`,validation.userValidation, studentController.register)


module.exports = router
