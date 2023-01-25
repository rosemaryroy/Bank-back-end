// import db.js
const db = require('./db')

// import jsonwebtoken
const jwt = require('jsonwebtoken')

// register
const register = (uname, acno, pswd) => {
    // check acno is in mongodb - db.users.findOne()
    return db.User.findOne({
        acno
    }).then((result) => {
        console.log(result);
        if (result) {
            // if acno exists
            return {
                statusCode: 401,
                message: 'Account already exist'
            }
        }
        else {
            // to add new user
            const newUser = new db.User({
                username: uname,
                acno: acno,
                password: pswd,
                balance: 0,
                transaction: []
            })
            newUser.save()
            return {
                statusCode: 200,
                message: 'Registration successful'
            }
        }
    })
}
// login
const login = (acno, pswd) => {
    console.log('inside login function');
    // check acno ,pswd is in mongodb - db.users.findOne()
    return db.User.findOne({
        acno,
        password: pswd
    }).then((result) => {
        if (result) {

            // generate token
            const token = jwt.sign({
                currentAcno:acno
            },'supersecretkey123')
            return {
                statusCode: 200,
                message: 'login successful',
                username: result.username,
                currentAcno: acno,
                token
            }
        }
        else {
            return {
                statusCode: 404,
                message: 'Invalid Acc/password'
            }
        }
    })

}
// getBalance
const getBalance = (acno) => {
    return db.User.findOne({
        acno
    }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                balance: result.balance
            }
        }
        else{
            return{
                statusCode: 404,
                message: 'Invalid Account'
            }
        }
    }
    )
}

// deposite
const deposite =(acno,amt)=>{
    let amount = Number(amt)
    return db.User.findOne({
        acno
    }).then((result)=>{
        if(result){
            // acno is present in db
            result.balance += amount
            result.transaction.push({
                type:"CREDIT",
                fromAcno:acno,
                toAcno:acno,
                amount
            })
            // to save update in mongodb
            result.save()
            return{
                statusCode: 200,
                message: `${amount} successfully deposited` 
            }
        }
        else{
            return{
                statusCode: 404,
                message: 'Invalid Account'
            }
        }
    })
}

// fundTransfer

const fundTransfer = (req,toAcno,pswd,amt)=>{
    let amount = Number(amt)
    let fromAcno = req.fromAcno
    return db.User.findOne({
        acno:fromAcno,
        password:pswd
    }).then(result=>{

        console.log(result);
        if(fromAcno==toAcno){
            return{
                statusCode:401,
                message:"Permission denied to own account transfer!!"
            }
        }
        if(result){
            // debit account details
            let fromAcnoBalance=result.balance
            if(fromAcnoBalance>=amount){
                result.balance = fromAcnoBalance - amount
                // credit account details
                return db.User.findOne({
                    acno:toAcno
                }).then(creditdata=>{
                    if(creditdata){
                        creditdata.balance += amount
                        creditdata.transaction.push({
                            type:"CREDIT",
                            fromAcno,
                            toAcno,
                            amount
                        })
                        creditdata.save();
                        console.log(creditdata);
                        result.transaction.push({
                            type:"DEBIT",
                            fromAcno,
                            toAcno,
                            amount
                        })
                        result.save();
                        console.log(result);
                        return{
                            statusCode:200,
                            message:"Amount transfered successfully"
                        }
                    }
                    else{
                        return{
                            statusCode: 401,
                            message: "Invalid Debit Account number"
                        }
                    }
                })

            }
            else{
                return{
                    statusCode: 403,
                    message: "Insufficient Balance"
                }
            }
        }
        else{
            return{
                statusCode: 404,
                message: "Invalid Debit Account number or password"
            }
            
        }
    })

}

// getAllTransactions
const getAllTransactions = (req)=>{
    let acno = req.fromAcno
    return db.User.findOne({
        acno
    }).then((result)=>{
        if(result){
            return{
                statusCode:200,
                transaction:result.transaction
            }
        }
        else{
            return{
                statusCode: 401,
                message: "Invalid Account number"
            }
        }
    })
}

// delete account
const deleteMyAccount = (acno)=>{
    return db.User.deleteOne({
        acno
    })
    .then((result)=>{
        if(result){
            return{
                statusCode:200,
                message:"Account deleted successfully"
            }
            
        }
        else{
            return{
                statusCode: 401,
                message: "Invalid Account"
            }
        }
    })
}


// export
module.exports = {
    register,
    login,
    getBalance,
    deposite,
    fundTransfer,
    getAllTransactions,
    deleteMyAccount
}