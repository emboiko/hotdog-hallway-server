require("dotenv").config()
const express = require("express")
const { Client, Intents } = require('discord.js');
const Application = require("../models/application")

const router = new express.Router()

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS] });
discordClient.login(process.env.DISCORD_TOKEN);
discordClient.once('ready', () => {
	console.log('Discord Client Ready')
})

router.post("/", async (req, res) => {
  const application = new Application(req.body)

  let message = ""
  message += `New guild application recieved from ${application.characterName}.\n`
  message += "(Link wont work yet)\n"
  message += `${process.env.APP_URL}/applications/${application._id}\n`
  
  try {
    await application.save()
    discordClient.channels.cache.get(process.env.DISCORD_APPLICATION_CHANNEL_ID).send(message)
    res.status(200).json({application})
  } catch (err) {
    console.log(err)
    res.status(500).json({error:err})
  }
})

module.exports = router
