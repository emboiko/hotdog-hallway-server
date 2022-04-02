const isCouncilMember = async (req, res, next) => {
  if (req.user.guildMemberLevel !== 3) return res.status(400).json({error:"Unauthorized."})
  next()
}

module.exports = isCouncilMember
