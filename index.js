

//  import express
const express = require('express')

// import cors
const cors = require('cors')

// import data service
const dataService = require('./services/dataService')

// import jsonwebtoken
const jwt = require('jsonwebtoken')

// create server app using express
const server = express()

// use cors
server.use(cors({
    origin: 'http://localhost:4200'
}))

// to parse json
server.use(express.json())

// Set up port number for server application
server.listen(3000, () => {
    console.log('server started at 3000');
})


// get http
server.get('/', (req, res) => {
    res.send('Get Method')
})

server.post('/', (req, res) => {
    res.send('Post Method')
})

server.put('/', (req, res) => {
    res.send('Put Method')
})

server.delete('/', (req, res) => {
    res.send('Delete Method')
})

// application specific middleware
const appMiddleware = (req,res,next)=>{
    console.log('Inside application specific middleware');
    next()
 }
server.use(appMiddleware)

// bank app front end request resolving

// token verify middleware
const jwtMiddleware = (req,res,next)=>{
    console.log('Inside router specific middleware');
    // get token from request headers
    const token = req.headers['access-token']
    try{
        // verify the token
    const data = jwt.verify(token,'supersecretkey123')
    console.log('data');
    req.fromAcno = data.currentAcno
    console.log('valid Token');
    next()
    }
    catch{
        console.log('invalid token');
        res.status(401).json({
            message:'please login!'
        })
    }
}

// register api call
server.post('/register', (req, res) => {
    console.log('Inside register function');
    console.log(req.body);
    // asynchronous
    dataService.register(req.body.uname, req.body.acno, req.body.pswd)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

// login
server.post('/login', (req, res) => {
    console.log('Inside login function');
    console.log(req.body);
    // asynchronous
    dataService.login(req.body.acno, req.body.pswd)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

// getBalance
server.get('/getBalance/:acno',jwtMiddleware, (req, res) => {
    console.log('Inside get Balance api');
    console.log(req.params.acno);
    // asynchronous
    dataService.getBalance(req.params.acno)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

// deposite api
server.post('/deposite',jwtMiddleware, (req, res) => {
    console.log('Inside deposite api');
    console.log(req.body);
    // asynchronous
    dataService.deposite(req.body.acno,req.body.amount)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

// fundTransfer api
server.post('/fundTransfer',jwtMiddleware, (req, res) => {
    console.log('Inside fundTransfer api');
    console.log(req.body);
    // asynchronous
    dataService.fundTransfer(req,req.body.toAcno,req.body.pswd,req.body.amount)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

// getAllTransactions
server.get('/all-transactions',jwtMiddleware,(req,res)=>{
    console.log('inside all transaction api');
    dataService.getAllTransactions(req)
    .then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

// delete account api 
server.delete('/delete-account/:acno',jwtMiddleware,(req,res)=>{
    console.log('inside delete account api');
    console.log(req.params.acno);
    // asynchronous
    dataService.deleteMyAccount(req.params.acno)
    .then((result)=>{
        res.status(result.statusCode).json(result)
    })
})