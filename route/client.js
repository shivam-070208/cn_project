const meetingmodel = require('../database/meetingmodel');

const clientRoute = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

clientRoute.get('/google-auth', (req, res) => {

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
        try {
            jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            return res.redirect('/');
        } catch (error) {
            res.clearCookie('token');
        }
    }
   res.render('signin');
    
}
);
const handleLogout = (req, res) => {
    res.clearCookie('token', { path: '/' });

    if (req.session) {
        return req.session.destroy(() => {
            res.redirect(303, '/intro?message=You%20have%20been%20logged%20out');
        });
    }

    res.redirect(303, '/intro?message=You%20have%20been%20logged%20out');
};

clientRoute.all('/logout', handleLogout);
clientRoute.get('/',(req, res) => {
        if(req.cookies && req.cookies.token){
            try {
                jwt.verify(req.cookies.token, process.env.JWT_SECRET);
                return res.render('main');
            } catch (error) {
                res.clearCookie('token');
            }
        }

        res.redirect('/intro');

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
        if(!token)
           return res.redirect("/login")
          const decoded = jwt.verify(token,process.env.JWT_SECRET);
   
          if(decoded.id == meeting.host) return res.status(200).render('meeting',{host:true,id:id});
        res.status(200).render('meeting',{host:false,id:id});
    }catch(error){
        res.status(500).send(`sorry error at server${error}`)
    }
})


module.exports = clientRoute;