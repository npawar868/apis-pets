// 'use strict'

const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const knex = require('knex')({
    client: 'pg',
    version: '12.4',
    connection: {
      host : 'localhost',
      port : 5432,
      user : 'postgres',
      password : 'root',
      database : 'postgres'
    }
  })

  app.use(cookieParser())
  app.use(cors());

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

app.post('/login', async(req, res, next) => {
    try {
        const userName = req.body.userName
        const password = req.body.password

        const result  = await knex('users').where('username', userName).where('password', password).limit(1)

        if(result.length > 0) {
            const {user_id, username, email} = result[0]
            const token = jwt.sign({id: user_id}, 'mysecrete', {expiresIn:300})

            req.session.user = result

            res.json({auth:true, token, userInfo: {userName: username, userId: user_id, email}})
        }
        return res.json({auth:false, userInfo: undefined})
    } catch(error) {
        return error
    }
})

app.post('/register', async(req, res, next) => {
    try {
        const {userName, password, email, } = req.body

        const result  = await knex('users').insert({username:userName, password, email, created_on: new Date()})

        const registeredUser  = await knex('users').where('username', userName).where('password', password).limit(1)
        if(registeredUser.length > 0 ) {

            req.session = {user: registeredUser}

            const {user_id, username, email} = registeredUser[0]

            const token = jwt.sign({id: user_id}, 'mysecrete', {expiresIn:300})

            return res.json({auth:true, token, userInfo: {userName: username, userId: user_id, email}})
        }
        return res.json({auth:'false2', userInfo: undefined}) 
    }catch(error) {

        return res.json({auth:'false3', userInfo: error}) 
    }
})


app.get('/pet/list', async(req, res) => {
    try {

        const result  = await knex('pets').select('*')

        return res.json({data: result})
    } catch(error) {
        return res.json({data: []})
    }
})

app.post('/pet/create', async(req, res) => {
    try {
        const {animalName, breed, price, dob, imageUrl, description } = req.body
        console.log(req.body.description);
        const result  = await knex('pets').insert(
            {
                imageurl: imageUrl,
                name: animalName,
                breed,
                price,
                dob,
                created_on: new Date(),
                description,
            })

        return res.json({message: result})
    } catch(error) {
        return res.json({message: error})
    }
})

// app.use('/', (req,res)=>{
//    return res.json({message: 'default'});
// });
app.listen(9000, ()=>{
    console.log('apis started');
});