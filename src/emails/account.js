const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_APA_KEY);
const sendWelcomeEmail = (email,name)=>{
 sgMail.send({
     to: email,
     from: 'swastikpal0812@gmail.com',
     subject: 'this is my first creation',
     text: 'welcome to the app '+name+' .let me know how you get along with the app'
 }).then(()=>{
     console.log('message sent');
 }).catch((error)=>{
     console.log(error.response.body);
 })
}


module.exports = {
    sendWelcomeEmail
}