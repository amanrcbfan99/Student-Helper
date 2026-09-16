const adminModel = require(`../models/admin.model`)
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require(`jsonwebtoken`)

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

async function SendingSecurityMail(){
    const transporter = await nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
        
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_KEY
            }
        })

        await transporter.sendMail({
            from : process.env.SENDER_EMAIL,
            to : process.env.WEB_SECURITY_EMAIL,
            subject : "Security Aleart",
            text : `Someone is attempting to access the Admin Panel.
            Please verify the login activity and take necessary action if this attempt was not authorized.`
            
        })
}

async function criteriaToSendMail(){

        if(sureAcc.failedAttempts == 3){
        await SendingSecurityMail()
        sureAcc.failedAttempts = 0
        await sureAcc.save()   

    }

}
let sureAcc;

async function originalAcc(){
    sureAcc = await adminModel.findOne({
    email : process.env.ADMIN_EMAIL
})
}
originalAcc()

async function adminLogin(req, res){

    const {email, password} = req.body
    const adminAcc = await adminModel.findOne({
        email
    })

    if(!adminAcc){
        sureAcc.failedAttempts++
        await sureAcc.save() 
        await criteriaToSendMail() 
        return res.status(401).json({
            message : "Wrong credentials entered"
        })
        
    }

        const isPasswordValid = await bcrypt.compare(password, adminAcc.password)

        if(!isPasswordValid){

            adminAcc.failedAttempts++
            await adminAcc.save()
            await criteriaToSendMail()
            return res.status(401).json({
                message : `Wrong Credentials entered`
            })

        }

        const token = jwt.sign({
            id : adminAcc._id
        }, process.env.JWT_SECRET)

        res.cookie("Admin-Login-token", token)

        adminAcc.failedAttempts = 0
        await adminAcc.save()

        return res.status(200).json({
            message : "Logged In successfully"
        })



}

module.exports = {adminInitialization, adminLogin};
