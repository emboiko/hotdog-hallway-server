require("dotenv").config()
const { Client, Intents } = require('discord.js');
const { DISCORD_CHANNELS, APPLICATION_RESPONSES } = require("../utilities/constants.js")

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MEMBERS"] })
discordClient.login(process.env.DISCORD_TOKEN)

discordClient.once('ready', async (client) => {
	console.info('Discord Client Ready')
})

const sendMessageToChannel = async (channel, message) => {
  discordClient.channels.cache.get(DISCORD_CHANNELS[channel]).send(message)
}

const sendApplicationResponseToUser = async (status, discordUsername) => {
  const guild = await discordClient.guilds.cache.find((guild) => guild.id === process.env.DISCORD_SERVER_ID)
  const members = await guild.members.fetch()
  const member = members.find((member) => {
    return `${member.user.username}#${member.user.discriminator}` === discordUsername
  })
  
  if (!member) {
    console.warn(`Discord service - discord member ${discordUsername} not found.`)
    sendMessageToChannel("applications", `User ${discordUsername} not found for '${status}' application response.`)
    return false
  }

  await member.send(APPLICATION_RESPONSES[status])
  return true
}

const getInvite = async () => {
  const invite = await discordClient.channels.cache.get(DISCORD_CHANNELS["general-chat"]).createInvite({maxAge:0,maxUses:0})
  return invite.code
}

module.exports = {
  sendMessageToChannel,
  sendApplicationResponseToUser,
  getInvite
}