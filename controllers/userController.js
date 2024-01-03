const asyncHandler= require("express-async-handler")
const bycrpt= require("bcrypt")
const jwt= require("jsonwebtoken")
const User= require("../models/userModel")
const { Error } = require("mongoose")


//@desc Register a user
//@route Post /api/users/register
//@access public
const registerUser= asyncHandler(async(req, res)=>{
    const{username, email, password}=req.body
    if(!username || !email || !password){
        res.status(400)
        throw new Error("All fields are mandatory")
    }
    const userAvailable= await User.findOne({email})
    if(userAvailable){
        res.status(400)
        throw new Error("User already registered!")
    }

    //Hash Password
    const hashedpassword= await bycrpt.hash(password, 10)
    console.log("HashedPassword: ", hashedpassword)
    const user= await User.create({
        username,
        email,
        password: hashedpassword,
    })
    console.log(`User created ${user}`)
    if(user){
        res.status(201).json({ _id:user.id, email:user.email})
    }else{
        res.status(400)
        throw new Error("Something Went Wrong")
    }
   res.json({message:"Register the User"})
})

//@desc Login User
//@route Post/api/users/login
//@access public
const loginUser= asyncHandler(async(req, res)=>{
    const {email, password}= req.body
    if(!email || !password){
        res.status(400)
        throw new Error("All fields are mandotory")
    }
    const user= await User.findOne({email})
    //compare password with hashedpassword
    if(user && (await bycrpt.compare(password, user.password))){
        const accessToken= jwt.sign({
            user:{
                username: user.username,
                email:user.email,
                id:user.id,
            },
        }, process.env.ACCESS_TOKEN_SECERT,
        {expiresIn: "1m"}
        )
        res.status(200).json({accessToken})
    } else{
        res.status(401)
        throw new Error("Email or Password is not valid")
    }
})

//@descCurrent user info
//@route Post/api/users/current
//@access private
const currentUser= asyncHandler(async(req, res)=>{
    res.json({message:"Current user information"})
})

module.exports={registerUser, loginUser, currentUser}