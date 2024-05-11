const app = require('./index');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:'./config.env'});

mongoose.connect(process.env.MONGO_URL).then(console.log("connection successful"));

app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`);
});
