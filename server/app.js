const express = require("express")
const cors = require('cors')
const router = require("./router/router")
require("./db/mongoose")

const app = express()

app.use(cors({
  origin: process.env.APP_URL,
}))
app.use(router)

module.exports = app
