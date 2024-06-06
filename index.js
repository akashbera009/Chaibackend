require('dotenv').config()
const express = require('express')
const app= express()
const port= 0
app.get('/',(req,res)=>{
    res.send("Hello World ")
})
app.get('/twitter',(req,res)=>{
    res.send("Twitter Opening ...")
})
app.get('/login',(req,res)=>{
    res.send("<h1>Login Page Arrived</h1>")
})
app.get('/content',(req, res)=>{
    res.send('<a href="www.google.com>Go to google </a>')
})
app.listen(process.env.PORT,()=>{     // Instead of writing port  variable , we use environment variable  
    console.log(`Example app listining on port ${port}`)
})