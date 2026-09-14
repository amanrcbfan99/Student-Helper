const adminModel = require(`../models/admin.model`)
const bcrypt = require("bcrypt")

async function adminInitialization(){

    const email = process.env.ADMIN_EMAIL
    const isAdminAlreadyExists = await adminModel.findOne({email})

    if(isAdminAlreadyExists){
        return console.log("admin already exists")
    }
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME
    const role = "admin"
    const hashedPassword = await bcrypt.hash(password, 10)

    await adminModel.create({
        email : email,
        password : hashedPassword,
        name : name,
        role : role
    })

        console.log("admin Created")
    
}

adminInitialization()


async function adminLogin(req, res){

}

module.exports = {adminInitialization, adminLogin}