const express = require("express")
const router = express.Router()

const applicationRouter = require("./applicationRouter")
const userRouter = require("./userRouter")

router.use("/applications", applicationRouter)
router.use("/users", userRouter)

module.exports = router
