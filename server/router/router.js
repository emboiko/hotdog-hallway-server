const express = require("express")
const router = express.Router()

const testRouter = require("./testRoutes")

router.use("/test", testRouter)

module.exports = router
