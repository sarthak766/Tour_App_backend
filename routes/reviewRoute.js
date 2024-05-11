const express = require('express')
const {getAllReviews, createReview} = require('../controllers/ReviewController')
const {protect, restrictTo} = require('../controllers/authController');
const router = express.Router()

router.route('/')
.get(getAllReviews)
.post(protect,restrictTo('user'),createReview)