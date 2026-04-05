const meetingmodel = require('../database/meetingmodel');

const clientRoute = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

clientRoute.get('/google-auth', (req, res) => {
    console.log(req.query);
   res.redirect('/login?message=Google%20authentication%20is%20not%20implemented%20yet');

});
clientRoute.get('/login', (req, res) => {
    const { message } = req.query;
    if (message) {
        res.render('login', { message });
    } else {
        res.render('login',{ message: null });
    }
   
}
);
clientRoute.get('/signin', (req, res) => {
    if(req.cookies && req.cookies.token){
        res.redirect('/')
    }
   else res.render('signin');
    
}
);
clientRoute.get('/',(req, res) => {
        
        if(req.cookies && req.cookies.token){
         
            res.render('main');
        }else{
            res.redirect('/intro');
        }

}
);
clientRoute.get('/intro',(req, res) => {
    const {message}=req.query
    
        res.render('home',{message:message??''});

}
);
clientRoute.get('/meet',async (req,res)=>{
    const {id} = req.query;
    console.log(id)
    try{
        const meeting = await meetingmodel.findOne({meetingId:id});
        if(!meeting)return res.status(404).render('error');
        
        const token = req.cookies.token;
        const email = jwt.verify(token,process.env.JWT_SECRET);
   
        if(email.id == meeting.host) return res.status(200).render('meeting',{host:true,id:id});
        res.status(200).render('meeting',{host:false,id:id});
    }catch(error){
        res.status(500).send(`sorry error at server${error}`)
    }
})


module.exports = clientRoute;