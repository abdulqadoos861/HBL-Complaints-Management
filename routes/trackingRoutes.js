const express = require('express')
const router = express.Router()
const trackingController = require('../controller/trackingController')

router.get('/tracking/:complaintNumber', trackingController.trackComplaintByNumber)
router.post('/customer-reply', trackingController.customerReply)

module.exports = router

