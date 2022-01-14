const express = require("express")
const cors = require("cors")
const router = express.Router()
const applicationRouter = require("./applicationRouter")
const userRouter = require("./userRouter")

const whitelist = [process.env.APP_URL]

const corsOptionsDelegate = function (req, callback) {
  let corsOptions

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } 
  } else {
    corsOptions = { origin: false } 
  }
  callback(null, corsOptions)
}

router.use("/applications", cors(corsOptionsDelegate), applicationRouter)
router.use("/users", cors(corsOptionsDelegate), userRouter)

module.exports = router
