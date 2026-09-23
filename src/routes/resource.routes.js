const express = require(`express`)
const router = express.Router()
const auth = require(`../middleware/midddleware.student`)
const resourceController = require(`../controller/resource.controller`)

router.get(`/pyq`, auth.checkCurrentUser, resourceController.getPyq)
router.get(`/pyq/:id`, auth.checkCurrentUser, resourceController.downloadPyq)
router.post(`/pyq/:id/save`, auth.checkCurrentUser, resourceController.saveResource)
module.exports = router