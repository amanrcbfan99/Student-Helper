const express = require(`express`)
require(`dotenv`).config()
const app = express()
const router = require(`./routes/routes.studends`)
const cookieParser = require("cookie-parser")
const adminRouter = require("./routes/admin.routes")
const resourceRoutes = require(`./routes/resource.routes`)


app.use(cookieParser())
app.use(express.json())
app.use("/resource", resourceRoutes)
app.use("/auth", router);
app.use("/admin", adminRouter)
module.exports = app