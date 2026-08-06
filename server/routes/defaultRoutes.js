const homeRoute = require('express').Router();

homeRoute.get('/', (req,res)=>{
    res.status(200).json({
        Status: true,
        message: "Welcome to the default route"
    })
})

module.exports = {homeRoute};