var express = require('express')
var router  = express.Router()

router.get('/', (req, res) => {
  console.log(req)
  res.end()
})

module.exports = router
