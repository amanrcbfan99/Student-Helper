const express = require(`express`)
const router = express.Router()
const adminController = require(`../controller/admin.controller`)
const loginlimiter = require(`../middleware/rateLimiter.middleware`)
const adminAuthentication = require(`../middleware/adminAuth.middleware`)

router.post(`/login`,loginlimiter.adminLoginlimiter, adminController.adminLogin)
router.get(`/students/count`, adminAuthentication.adminAuth, adminController.countStudent)
router.get(`/students`, adminAuthentication.adminAuth, adminController.getAllstudents)
router.get(`/students/:id`, adminAuthentication.adminAuth, adminController.getSpecificStudent)
router.patch(`/students/suspend/:id`, adminAuthentication.adminAuth, adminController.suspendStudent)
router.patch(`/students/activate/:id`, adminAuthentication.adminAuth, adminController.activateStudent)
router.delete(`/students/delete/:id`, adminAuthentication.adminAuth, adminController.deleteStudent)
module.exports = router