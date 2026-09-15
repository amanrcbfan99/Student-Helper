const adminModel = require(`../models/admin.model`)
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require(`jsonwebtoken`)


async function adminInitialization() {

    const email = process.env.ADMIN_EMAIL

    const isAdminAlreadyExists = await adminModel.findOne({ email })

    if (isAdminAlreadyExists) {
        return console.log("admin already exists")
    }

    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME
    const role = "admin"

    const hashedPassword = await bcrypt.hash(password, 10)

    await adminModel.create({
        email,
        password: hashedPassword,
        name,
        role
    })

    console.log("admin Created")
}


adminInitialization()


async function SendingSecurityMail() {

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,

        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY
        }
    })

    await transporter.sendMail({
        to: process.env.WEB_SECURITY_EMAIL,
        from: process.env.ADMIN_EMAIL,
        subject: "Security Alert",
        text: `Someone is attempting to access the Admin Panel.

Please verify the login activity and take necessary action if this attempt was not authorized.`
    })
}


async function adminLogin(req, res) {

    const { email, password } = req.body

    const adminAcc = await adminModel.findOne({ email })

    // Admin account not found
    if (!adminAcc) {
        return res.status(401).json({
            message: "Wrong credentials entered"
        })
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        adminAcc.password
    )

    // Wrong password
    if (!isPasswordValid) {

        adminAcc.failedAttempts += 1

        await adminAcc.save()

        return res.status(401).json({
            message: `Wrong credentials entered. You have only ${3 - adminAcc.failedAttempts} attempts left`
        })
    }

    // Create JWT
    const token = jwt.sign(
        {
            id: adminAcc._id
        },
        process.env.JWT_SECRET
    )

    // Store token in cookie
    res.cookie("Admin-Login-token", token)

    // Reset failed attempts after successful login
    adminAcc.failedAttempts = 0
    await adminAcc.save()

    return res.status(200).json({
        message: "Logged in successfully"
    })
}


module.exports = {
    adminInitialization,
    adminLogin
}