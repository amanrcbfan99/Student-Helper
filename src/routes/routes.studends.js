const express = require(`express`)
const router = express.Router()
const studentController = require(`../controller/student.controller`)
// const express = require(`express`)
// const router = express.Router()

router.post(`/register`, studentController.register)


module.exports = router
