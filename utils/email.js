const nodemailer = require('nodemailer');

const sendEmail = options =>{
    //create a transporter
       const transporter = nodemailer.createTransporter({
        service : 'Gmail',
        auth:{
            user: process.env.GMAIL,
            pass: process.env.PASS
        }

       })

    //Activate "less secure app" option in gmail
     
    //define the email address

    //actually send the email
}