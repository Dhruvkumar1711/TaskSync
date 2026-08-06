const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000;

const app = express();



app.get('/', (req, res) => {
    try{
        res.status(200).json({
            status: 'success',
             message: 'Server is running'
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
             message: 'Internal Server Error' ,
             error: error.message
            }); 
    }
});

app.listen(process.env.PORT,(err)=>{
   if (err) {
        console.log(err)
    }
    
    console.log(`Successfully Connected to Server at Port: ${process.env.PORT}`)
    
})