const {promisify} = require('util')
const User = require('../models/usermodel')
const jwt = require('jsonwebtoken');
const Apperror = require('../utils/error');
const bcrypt = require('bcrypt');
exports.signup = async (req,res,next)=>{

  const newUser= await User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm
  });
  const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN
  })
   const cookieOptions = {
    expires : new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
    //to prevent crossite scripting attacks
    // secure:true,only when we are in production
    httpOnly:true
   }
   res.cookie('jwt',token,cookieOptions)

  res.status(201).json({
    status: 'success',
    token,
    data:{
        user: newUser,   
    }
  })

}

exports.login = async (req, res, next)=>{
  const {email,password} = req.body;
   if(!email || !password) {
     return next(new Apperror('please provide email and password',400));
   }
   const user = await User.findOne({email}).select('+password')
  //  const correct = await user.correctPassword(password,user.password);
   if(!user || !(await user.correctPassword(password,user.password))){
    return next(new Apperror('Incorrect email or password',404));
   }
   const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN
  })
   res.status(200).json({
    status: 'success',
    token
   })
}


exports.protect = async (req,res,next)=>{
  let token;
  //checking if token exists
   if(req.headers.authorization && req.headers.authorization.startsWith('bearer')){
     token =req.headers.authorization.split(' ')[1];
   }  
  //  console.log(token);
   if(!token)
    {
      return next(new Apperror('You are not logged in please login'));
    }
    //verifying token
     const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET);
     console.log(decoded)
     //check user if still exists 
     const freshUser = await User.findById(decoded.id);
      if(!freshUser) {
        return next(new Apperror('The user belonging to this user no longer exist',401));       
      }  
      //check if user changed their password 
      if(freshUser.changedPasswordAfter(decoded.iat)){
        console.log('user recently changed password');
      } 
      //Grant access to the user
      req.user = freshUser;
  next();
}
// only admins can delete
exports.restrictTo= (...roles)=>{
  return (req,res,next) =>{
    if(!roles.includes(req.user.role)){
      return next(new Apperror('You do not have permission to access this action',404))
    }
    next()
  }
}


exports.forgotPassword = async (req, res, next) => {
  // Get user based on posted email
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new Apperror('There is no user with this email address', 404));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset token to user's email
  // Code to send the email goes here

  res.status(200).json({
    status: 'success',
    message: 'Reset token sent to email!',
  });
};

exports.resetPassword =  function(){

}
