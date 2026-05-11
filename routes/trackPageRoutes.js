const express = require('express')
const router = express.Router()

router.get('/track', (req, res) => {
  res.render('trackComplaint')
})

module.exports = router

