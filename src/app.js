const express = require(`express`)
require(`dotenv`).config()
const app = express()
const router = require(`./routes/routes.studends`)

app.use(express.json())
app.use("/auth", router);
module.exports = app