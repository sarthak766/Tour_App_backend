const mongoose= require('mongoose');
const validator = require('validator');
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"a tour must have a name"],
        unique:true,
        maxlength :[40,"A tour must have less than or equal to 40 characters"] ,
        minlength:[10,"A tour must have more than 10 characters"],
        validate:[validator.isAlpha,'Tour must be a valid alphabet']
    },
    duration:{
            type:Number,
            required:[true,"a tour must have a duration"]
    },
    maxGroupSize:{
        type:Number,
        required:[true,"a tour must have a max group size"]
    },
     difficulty:{
          type:String,
          required:[true,"a tour must have a difficulty"],
          enum:{
            values:['easy', 'medium', 'difficult'],
            message:'Difficulty is either easy or medium or difficult'
        }
     },
    ratingsAverage : {
        type:Number,
         default:4.5,
         min :[1,"ratings can be min 1"],
         max :[5,"ratings can be max 5"]


    },
    ratingsQuantity : {
        type:Number,
         default:0,
    },
    price:{
        type:String,
        required:true,
    },
    priceDiscount:{
        type: Number,
        validate:
        {
              validator:function(val){
                //this only point to current document on new document creation
                return val<this.price //val here is priceDiscount

              },
              message:"Discount ({VALUE}) should be less than price"
    }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,"A tour must have description"]//remove whitespaces from beginning and end
    },
    description:{
        type:String,
        trim:true,
    },
    imageCover:{
        type:String,
        required:[true,"A tour must have image cover"]
    },
    images:{
        images:[String],
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false,
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false,
    },
    startLocation:{
        //Geojson
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point'],

            },
            coordinates:[Number],
             address:String,
             description:String,
        }
    ],
    guides:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    reviews:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Review',
        }
    ]

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

tourSchema.virtual('review',{
    ref: 'Review',
    foreignField:'tour',
    localField: '_id'
})

const Tour = mongoose.model('Tour',tourSchema);

//DOCUMENT MIDDLEWARE THAT WILL RUN BEFORE SAVE AND CREATE

// tourSchema.pre('save',function(next){
//    console.log(this);
// })

// tourSchema.post('save',function(doc,next){
//    console.log(doc);
//    next();
// })

tourSchema.virtual('durationWeeks').get(function(){  //we don't used arrow function because that do not have the this 
    return this.duration/7;
})

//Query middleware
tourSchema.pre(/^find/,function(next){
    this.find( { secretTour : { $ne : true} } )   //this is a query object so it will have access to query methods
    next();
 })

module.exports = Tour;