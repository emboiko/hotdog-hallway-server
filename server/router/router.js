const express = require("express")
const router = express.Router()
const applicationRouter = require("./applicationRouter")
const userRouter = require("./userRouter")
const utilityRouter = require("./utilityRouter")

router.use("/applications", applicationRouter)
router.use("/users", userRouter)
router.use("/utility", utilityRouter)

module.exports = router
