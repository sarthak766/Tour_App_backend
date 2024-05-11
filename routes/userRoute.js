const express = require('express')
const {getAllUsers,createUser,getUser,updateUser,deleteUser, UpdateMe}= require('./../controllers/userController');
const { signup, login, forgotPassword,resetPassword, protect } = require('../controllers/authController');
const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)

router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword',resetPassword)

router.patch('/updateme',protect,UpdateMe)

router.route('/')
.get(getAllUsers)
.post(createUser)

router.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser)

module.exports = router