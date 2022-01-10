const express = require("express")
const router = require("./router/router")
require("./db/mongoose")

const app = express()

app.use(router)

module.exports = app
