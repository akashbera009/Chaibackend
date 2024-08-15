require('dotenv').config()
const express = require('express')
const app=express()
const port= 3000;

app.get('/',(req,res)=>{
    res.send("testing success")
})

app.listen(process.env.PORT2,()=>{
    console.log(`testing app is runnning at ${process.env.PORT2}`)
})