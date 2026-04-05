const userRoute = require('express').Router();
const UserModel = require('../database/usermodule');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Contactmodel = require('../database/contact.js');
const meetingmodel = require('../database/meetingmodel.js');
dotenv.config();

userRoute.post('/login',async (req, res) => {
    const { Email , password } = req.body;

    try{
       
        const user = await UserModel.findOne({ email: Email });
        if(user){
           
            if(user.password === password){
                const token = jwt.sign(Email,process.env.JWT_SECRET,{
                    expiresIn: '10h'
                });
                res.clearCookie('token');
                res.cookie('token', token);
                res.redirect('/');
            }else{
                res.redirect('/login?message=Invalid%20credentials');
            }
        }
        else{
     
            res.redirect('/login?message=No%20user%20found');
        }
    }catch(err){
        console.log(err);
        res.redirect('/login?message=Error%20occurred%20at%20at%20server%20side');
    }

   
});
userRoute.post('/signin', async (req, res) => {
    const { username, Email, password } = req.body;
   
    try {
        const user = await UserModel.findOne({ email: Email });
        
        if (user) {
          return  res.status(500).redirect('/login?message=user%already%exist');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new UserModel({
                username,
                email: Email,
                password: hashedPassword
            });
            const token = jwt.sign({id:Email}, process.env.JWT_SECRET, {
                expiresIn: '10h'
            });
            
            res.clearCookie('token');
            res.cookie('token', token);
            await newUser.save();
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        if(err.code==11000) return res.redirect('/login?message=User%20alredy%20exist%20with%20username%20or%20email');
        res.redirect('/login?message=Error%20occurred%20at%20at%20server%20side');
    }
    
});
userRoute.post('/contact',async (req,res)=>{
    const {name,email} = req.body;
    try{
       await Contactmodel.create({name,email});
                res.redirect('/intro?message=thanks%20for%20connecting%20with%20us#contact');
    }catch(err){
        console.log(err);
        res.redirect('/intro?message=error%20at%20server%20side');
    }
})


userRoute.post('/create', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hostId = decoded.id;
        console.log(hostId)
        if (!hostId) {
            return res.status(400).json({ message: "Invalid token: Host data missing" });
        }

        let meetingId;
        while (true) {
            meetingId = Math.random().toString(36).substr(2, 8);
            const meetcheck = await meetingmodel.findOne({ meetingId });
            if (!meetcheck) break;
        }

        await meetingmodel.create({ meetingId, host: hostId });

        res.status(200).json({ data: meetingId });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = userRoute;