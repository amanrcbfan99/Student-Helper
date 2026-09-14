const express = require(`express`)
const router = express.Router()
const adminController = require(`../controller/admin.controller`)

router.post(`/adminLogin`, adminController.adminLogin)

module.exports = router