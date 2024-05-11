const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourmodel');


dotenv.config({path:'./config.env'});

mongoose.connect(process.env.MONGO_URL).then(console.log("connection successful"));

//Read json file
const tours = JSON.parse( fs.readFileSync('${__dirname}/tours-simple.json','utf-8'));

const importData = async (req, res) => {
    try{
       await Tour.create(tours)
       console.log("data successfully loaded");
    }
    catch(err){
           console.log(err);
    }
}
//deleting all the data from db

const deleteData = async (req, res) => {
    try{
        await Tour.deleteMany()
        console.log("data successfully deleted");
     }
     catch(err){
            console.log(err);
     }
}

importData();