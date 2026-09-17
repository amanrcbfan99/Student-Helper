const express = require(`express`)
const router = express.Router()
const adminController = require(`../controller/admin.controller`)
const loginlimiter = require(`../middleware/rateLimiter.middleware`)
const adminAuthentication = require(`../middleware/adminAuth.middleware`)

router.post(`/login`,loginlimiter.adminLoginlimiter, adminController.adminLogin)
router.get(`/students`, adminAuthentication.adminAuth, adminController.getAllstudents)
module.exports = router