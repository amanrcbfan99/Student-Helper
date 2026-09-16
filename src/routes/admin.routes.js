const express = require(`express`)
const router = express.Router()
const adminController = require(`../controller/admin.controller`)
const loginlimiter = require(`../middleware/rateLimiter.middleware`)
router.post(`/login`,loginlimiter.adminLoginlimiter, adminController.adminLogin)

module.exports = router