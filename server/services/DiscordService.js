require("dotenv").config()
const { Client, Intents } = require('discord.js');
const { DISCORD_CHANNELS } = require("../utilities/constants.js")

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS] })
discordClient.login(process.env.DISCORD_TOKEN)

discordClient.once('ready', async (client) => {
	console.info('Discord Client Ready')
})

const sendMessageToChannel = async (channel, message) => {
  discordClient.channels.cache.get(DISCORD_CHANNELS[channel]).send(message)
}

const getInvite = async () => {
  const invite = await discordClient.channels.cache.get(DISCORD_CHANNELS["general-chat"]).createInvite({maxAge:0,maxUses:0})
  return invite.code
}

module.exports = {
  sendMessageToChannel,
  getInvite
}