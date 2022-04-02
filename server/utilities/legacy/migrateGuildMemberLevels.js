// This legacy route was created to be ran once while refactoring rank booleans (isGuildMember, isCouncilMember) to rank levels (guildMemberLevel).

const User = require("../models/user")
// const isCouncilMember = require("../middleware/isCouncilMember")
// const isLoggedIn = require("../middleware/isCouncilMember")
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