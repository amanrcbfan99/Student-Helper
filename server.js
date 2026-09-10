const app = require(`./src/app`)
const connectDb = require(`./src/Db/db`)

app.listen(3000, ()=>{
    console.log("server is running smoothly")
    connectDb()
})