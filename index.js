const express =require('express')
const app = require('cors')
const app = express()

app.use(cors())

app.use('/', (req,res)=>{
    res.json({message:'default'})
})


app.listen(9000, ()=>{
    console.log('apis started');
})