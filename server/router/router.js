const express = require("express")
const cors = require('cors')
const router = express.Router()
const applicationRouter = require("./applicationRouter")
const userRouter = require("./userRouter")


const production_allowed_origins = [
  /\.hotdog-hallway\.com$/
]

const corsOptionsDelegate = function(req, callback) {
  var corsOptions = {}

  switch (process.env.NODE_ENV.toUpperCase()) {
      case 'TEST':
      case 'DEVELOPMENT':
          corsOptions["origin"] = true
          break
      case 'PRODUCTION':
      default:
          corsOptions["origin"] = production_allowed_origins
          break
  }
  callback(null, corsOptions)
}

const allowCors = cors(corsOptionsDelegate)

router.use("/applications", allowCors, applicationRouter)
router.use("/users", allowCors, userRouter)

module.exports = router
