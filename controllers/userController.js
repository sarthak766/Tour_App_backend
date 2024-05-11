const User = require('../models/usermodel');


exports.getAllUsers= async (req, res,next) => {
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        results:users.length,
        data:{
            users
        }
    }) 
};

exports.UpdateMe = (req,res,next) => {
    //create error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new Apperror('this route is not for password updates',404))
    }
    
}

exports.createUser = (req,res)=>{

};
exports.getUser = (req,res)=>{

};
exports.updateUser = (req,res)=>{

};
exports.deleteUser = (req,res)=>{

};