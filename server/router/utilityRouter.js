require("dotenv").config()
const express = require("express")
const DiscordService = require("../services/DiscordService")

const router = new express.Router()

router.get("/discordInviteCode", async (req, res) => {
  try {
    const code = await DiscordService.getInvite()
    res.status(200).json({code})
  } catch (error) {
    console.error(error)
    res.status(500).json({error:"Internal Server Error"})
  }
})

module.exports = router
