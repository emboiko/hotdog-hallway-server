require("dotenv").config()
const express = require("express")
const Application = require("../models/application")
const isLoggedIn = require("../middleware/isLoggedIn")
const isCouncilMember = require("../middleware/isCouncilMember")
const DiscordService = require("../services/DiscordService")

const router = new express.Router()

router.post("/", async (req, res) => {
  const application = new Application(req.body)

  let message = ""
  message += `New guild application recieved from ${application.username}.\n`
  message += "(Link wont work yet)\n"
  message += `${process.env.APP_URL}/applications/${application._id}\n`
  
  try {
    await application.save()
    DiscordService.sendMessageToChannel("applications", message)
    res.status(200).json({message:"Success"})
  } catch (error) {
    console.error(error)
    res.status(500).json({error})
  }
})

router.get("/:id", isLoggedIn, isCouncilMember, async (req, res) => {
  let application
  try {
    application = await Application.findById(req.params.id)
  } catch (error) {
    return res.status(500).json({error:"Internal Server Error"})
  }
  if (!application) return res.status(404).json({error:"Application Not found."})
  res.status(200).json({application})
})

module.exports = router
