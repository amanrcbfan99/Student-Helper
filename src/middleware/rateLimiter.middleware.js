const rateLimit = require(`express-rate-limit`)

const studentLoginLimiter = rateLimit({
    windowMs : 60*1000,
    limit : 5,
    message : {
        message : "Too many login attempts, Please try again later"
    }
})

const adminLoginlimiter = rateLimit({
    windowMs : 10*60*1000,
    limit : 3,
    message: {
        message : "To many login attempts, please try again later"
    }
})

module.exports = {studentLoginLimiter, adminLoginlimiter}