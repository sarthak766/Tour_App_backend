const express = require('express')
const {getAllTours,createTour,getTours,updateTour,deleteTour,aliasTopTours,getTourStats,getMonthlyPlan} = require('./../controllers/tourController');
const {protect,restrictTo} = require('../controllers/authController');
const router = express.Router();

// router.param('id',checkid)

router.route('/top-5-cheap').get(aliasTopTours,getAllTours)
// /tours/top-5-cheap
router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/')
    .get(protect,restrictTo('admin','leadguide'),getAllTours)
    .post(createTour);

router.route('/:id') // added forward slash
    .get(getTours)
    .patch(updateTour)
    .delete(deleteTour);

    module.exports = router;