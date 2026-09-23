const adminModel = require(`../models/admin.model`)
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require(`jsonwebtoken`)
const studentModel = require(`../models/student.model`)

async function adminInitialization(){

    const email = process.env.ADMIN_EMAIL
    const isAdminAlreadyExists = await adminModel.findOne({email})

    if(isAdminAlreadyExists){
        return 
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


async function getAllstudents(req, res){

    const limit = req.query.limit || 10
    const skip = req.query.skip || 0
    const search = req.query.search
    if(limit > 10){
        return res.status(400).json({
            message : "Maximum 10 students can be fetched at once"
        })
    }
    const students = await studentModel.find({
        $or : [
            {username : {
            $regex : search,
            $options : "i"
        }},
        {email : {
            $regex : search,
            $options : "i"
        }}
        ]
    })
    .limit(limit)
    .skip(skip)

    res.status(200).json({
        message : "Students fetched successfully",
        students
    })
}


async function getSpecificStudent(req, res){

    const id = req.params.id
    try {
        const user = await studentModel.findById(id)
        if(!user){
            return res.status(404).json({
                message : "User Not Found"
            })
        }

        res.status(200).json({
            message : "User fetched successflly",
            user
        })

        
    } catch (error){
        res.status(500).json({
            error
        })
    }
    

}

async function suspendStudent(req, res){
    
    
    try{
        const id = req.params.id

        const user = await studentModel.findById(id)
        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }

        user.isSuspended = true
        await user.save()
        res.status(200).json({
            message : "User suspended successfully"
        })


    } catch(error){
        res.status(500).json({
            error
        })
    }
}

async function activateStudent(req, res){

    try{

    const id = req.params.id

    //Finding User
    const user = await studentModel.findById(id)

    //If user did not exists
    if(!user){
        return res.status(404).json({
            message : "User not found"
        })
    }
        
    //If account already active
    if(user.isSuspended === false){
            return res.status(401).json({
                message : "User's account is already active"
            })
    }

    user.isSuspended = false
    await user.save()

    res.status(200).json({
        message : "User activated successfully"
    })
    }

    //Error handling
    catch(error){
        res.status(500).json({
            error
        })
    }

    
}

async function deleteStudent(req, res){

   try{

    const id = req.params.id
    const user = await studentModel.findById(id)

    if(!user){
        return res.status(404).json({
            message : "User not found"
        })
    }

    await studentModel.findByIdAndDelete(id)

    res.status(200).json({
        message : "User deleted successfully"
    })
   }
   
   catch(error){
    res.status(500).json(error)
   }


}

async function countStudent(req, res){
    

    try{

        //Total students
        const allStudent = await studentModel.countDocuments()

        //Active students
        const activeStudents = await studentModel.countDocuments({
            "isSuspended" : false
        })

        //Suspended Students
        const suspendedStudents = await studentModel.countDocuments({
            "isSuspended" : true
        })

        res.status(200).json({
            Total_Students : allStudent,
            Active_Students : activeStudents,
            Suspended_Students : suspendedStudents
        })

    } catch(error){
        res.status(500).json({
            error
        })
    }
}
module.exports = {adminInitialization, adminLogin, getAllstudents, getSpecificStudent, suspendStudent, activateStudent, deleteStudent, countStudent};
