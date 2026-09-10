const dns = require("dns");
const { mongo, default: mongoose } = require("mongoose");

dns.setServers(["8.8.8.8", "1.1.1.1"]);


const connectDb = async function connecting() {
    await mongoose.connect(process.env.MONGOOSE_CONNECTION_URI)
    console.log("Connected to DB")
} 

module.exports = connectDb