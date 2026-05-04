const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send("Hello every one")
})

app.listen(3000);