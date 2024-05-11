const express = require('express');
const fs = require('fs');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const Apperror = require('./utils/error');
const morgan = require('morgan');
const app = express();
const globalErrorHandler = require('./controllers/errorController');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');
//Global middleware
//Secuirty HTTP headers
app.use(helmet());
//sanitize data
app.use(mongoSanitize());
//clean malicious code injected by hackers
app.use(xss());
app.use(morgan('dev'));
//body parser
app.use(express.json({limit:'10kb'}));
//prevent parameter pollution 
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsQuantity'
    ]
}));
app.use(express.static((`${__dirname}/public`)))
//limiting req from same API
const limiter = ratelimit({
     max: 100,
     Windowms:60*60*1000,
     message:'too many requests from this IP please try again after 1 hour'
})

app.use('/api',limiter);

app.use((req, res, next) => {
    console.log("hello from middleware");
    next();
});

app.use((req, res, next) => {
    console.log(req.headers)
    req.requestTime = new Date().toISOString();
    next();
});


app.use('/api/v1/users',userRouter);
app.use('/api/v1/tours',tourRouter);
app.all('*',(req, res, next) => {
    // res.status(400).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server`
    // })
    next(new Apperror(`Can't find ${req.originalUrl} on this server`,404));
})

app.use(globalErrorHandler)
module.exports =app;

