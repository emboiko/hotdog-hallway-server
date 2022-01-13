const express = require("express")
const Application = require("../models/application")

const router = new express.Router()

router.post("/", async (req, res) => {
  const application = new Application(req.body)
  try {
    await application.save()
    res.status(200).json({application})
  } catch (err) {
    console.log(err)
    res.status(500).json({error:err})
  }
})

module.exports = router
