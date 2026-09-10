const express = require(`express`)
const router = express.Router()
const studentController = require(`../controller/student.controller`)
const validation = require(`../middleware/student.validation`)
// const express = require(`express`)
// const router = express.Router()

router.post(`/register`,validation.registerValidation, studentController.register)
router.post(`/login`, validation.loginValidation, studentController.login)

module.exports = router
