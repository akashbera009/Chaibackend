import express from 'express'
const app = express()
// require('dotenv').config()
const port= 3000;

app.get('/',(req,res)=>{
    res.send("practice server running ......")
})
app.get('/api/jokes',(req,res)=>{
    const jokes=[
        {
            id:1,
            title:"a joke",
            content:"this is a joke "
        },
        {
            id:2,
            title:"another joke",
            content:"this is another joke "
        },
        {
            id:3,
            title:"also another joke",
            content:"this is aalso another joke "
        },
        {
            id:4,
            title:"big another joke",
            content:"this is big another joke "
        },
        {
            id:5,
            title:"a big big joke",
            content:"this is big big  joke "
        },
        {
            id:6,
            title:"a big big joke",
            content:"this is big big  joke "
        }
    ];
    res.send(jokes)

})
app.listen(port,()=>{
    console.log(`server listining at ${port}`)
})