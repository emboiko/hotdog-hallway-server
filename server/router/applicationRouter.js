require("dotenv").config()
const express = require("express")
const Application = require("../models/application")
const User = require("../models/user")
const isLoggedIn = require("../middleware/isLoggedIn")
const isCouncilMember = require("../middleware/isCouncilMember")
const DiscordService = require("../services/DiscordService")
const { APPLICATION_STATUSES } = require("../utilities/constants")

const router = new express.Router()

router.post("/", isLoggedIn, async (req, res) => {
  const application = new Application({...req.body, owner:req.user._id})
  const user = await User.findById(req.user._id)

  if (user.applicationID) {
    return res.status(400).json({error: `Application already submitted for user: ${user.username}`})
  } else {
    user.applicationID = application._id
  }

  let message = ""
  message += `New guild application recieved from ${application.playerCharacterName}.\n`
  message += "(Link wont work yet)\n"
  message += `${process.env.APP_URL}/applications/${application._id}\n`

  application.status = APPLICATION_STATUSES.pending
  
  try {
    await application.save()
    await user.save()
    DiscordService.sendMessageToChannel("applications", message)
    res.status(201).json({message: "Success", applicationID: application._id})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Internal Server Error"})
  }
})

router.get("/mine/status", isLoggedIn, async (req, res) => {
  let application
  try {
    application = await Application.findOne({owner: req.user._id})
  } catch (error) {
    console.error(error)
    return res.status(500).json({error:"Internal Server Error"})
  }
  if (!application) return res.status(404).json({error:"Application Not found"})
  res.status(200).json({status:application.status})
})

router.get("/:id", isLoggedIn, isCouncilMember, async (req, res) => {
  let application
  try {
    application = await Application.findById(req.params.id)
  } catch (error) {
    console.error(error)
    return res.status(500).json({error:"Internal Server Error"})
  }
  if (!application) return res.status(404).json({error:"Application Not found"})
  res.status(200).json({application})
})

module.exports = router
