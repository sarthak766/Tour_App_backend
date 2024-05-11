const express = require('express')
const Tour = require('./../models/tourmodel')
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../data/devdata/tours-simple.json`, 'utf-8'));


exports.aliasTopTours = (req,res,next)=>{
    req.query.limit='5',
    req.query.sort='-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,duration';
    next();

}


exports.getTours = async (req, res) => {
    try{
        const tour= await Tour.findById(req.params.id).populate('guides');
        res.status(200).json({
                status: "success",
                data: {
                    tours: tour,
                }
            });
    
    }
    catch(err){
        res.status(400).json({
              status: "failed",
              message: err.message
        })
    }
    // 
};

exports.getAllTours = async (req, res) => {
    try {
        // Build Query
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach(ele => delete queryObj[ele]);

        // Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Tour.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortby=   req.query.sort.split(',').join(' ');
            query = query.sort(sortby);
            
        }
        else{
            query.sort('-createdAt');
        }
        //fields limiting
        if(req.query.fields){
            const fields =req.query.fields.split(',').join(' ');
            query = query.select(fields)

            }
        else{
            query.select('-__v');
        }
        //Pagination
        const page = req.query.page*1 || 1 
        const limit = req.query.limit*1 || 100;
        const skip=  (page-1) * limit;
        query = query.skip(skip).limit(limit);
         if(req.query.page){
           const numTours = await Tour.countDocuments();
           if(skip>=numTours){
            throw new Error('this page does not exist');
         }
        }
        // Execute Query
        const tours = await query;
       
        // Send Response
        res.status(200).json({ 
            status: 'success',
            date: req.requestTime,
            data: {
                tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "failed",
            message: err.message
        });
    }
};


exports.createTour = async (req, res) => {
   
    try{
        const newTour = await Tour.create(req.body)


    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/data/devdata/tours-simple.json`, JSON.stringify(tours), err => {

       res.status(201).json({
         message: "success",
         data: {
            tour:newTour
         }
     });
    }
    catch(err){
          res.status(404).json({
            status:"failed",
            message: err.message
          })
    }
};

exports.updateTour = async (req, res) => {
//this new will return the updated tour to the user

    try{
           const tour=  await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true
           })
           res.status(201).json({
            message: "success",
            data:tour,
        });
    }
     catch(err){
        res.status(404).json({
            message:err.message,
        });
     }
};

exports.deleteTour = async (req, res) => {
     try{

         await Tour.findByIdAndDelete(req.params.id);
          res.status(204).json({
            message: "success",
            data: null,
        });
     } 
   catch(err){
    res.status(404).json({
        message: "success",
        data: null,
    });

   }
};

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id:{ $toUpper:"$difficulty"},
                    num:{$sum:1},//1 is for every document
                    numRatings:{$sum:'$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort:{avgPrice:1} //1for ascending order
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } }
            // },
        ]);
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getMonthlyPlan=  async (req, res) => {
    try{
               const year = req.params.year*1;
               const plan = await Tour.aggregate([
                {
                    $unwind:'$startDates',//it take single date from document and for every date we have different dpocument with diff date
                },
                {
                    $match:{
                        startDates:{
                            $gte:new Date(`${year}-01-01`),
                            $lte:new Date(`${year}-12-31`)
                        }
                    }
                },{
                    $group:{
                        _id: {$month :'$startDates'},
                        numTourStarts:{$sum:1},
                        tours:{$push:'$name'},

                    }
                },
                   {
                     $addFields:{month : '$_id'}
                   },
                   {
                    $project:{
                        _id:0 //it will not show if we write 1 then it will show id
                    }
                   },
                   {
                      $sort :{numTourStarts:-1}
                   }

               ]);
               res.status(200).json({
                status: 'success',
                data: plan
            });

    }
    catch(err){

        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}