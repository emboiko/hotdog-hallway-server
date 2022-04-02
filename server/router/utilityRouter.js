require("dotenv").config()
const express = require("express")
// const isCouncilMember = require("../middleware/isCouncilMember")
// const isLoggedIn = require("../middleware/isCouncilMember")
const User = require("../models/user")
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

router.post("/migrateGuildMemberLevels", 
// isLoggedIn, isCouncilMember, 
  async (req, res) => {
    let users
    try {
      users = await User.find()
    } catch (error) {
      console.error(error)
      res.status(500).json({error: "Internal Server Error"})
    }

    users.forEach(async (user) => {
      if (user.isCouncilMember) user.guildMemberLevel = 3
      if (user.isGuildMember && !user.isCouncilMember) user.guildMemberLevel = 2
      if (!user.isGuildMember) user.guildMemberLevel = 0
      await user.save()
    })

    await User.updateMany({}, {$unset:{"isGuildMember":1, "isCouncilMember": 1}})
    res.status(200).json({message:`Updated ranks for ${users.length} users.`})
})

module.exports = router
