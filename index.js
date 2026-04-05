const express = require('express');
const http = require('http')
const app = express();
const path = require('path');
const {Server} = require('socket.io');


const connectDB = require('./config/mongodb');
const clientRoute = require('./route/client');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

const userRoute = require('./route/user');

// Connect to the database
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middle function 

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
    
    secret: 'hare_hare',
    resave: false,
    saveUninitialized: true,
    secure: true
}));

app.use(express.urlencoded({ extended: true }));
app.use('/', clientRoute);
app.use('/api', userRoute);
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
    res.status(404).render('error');
});


const server = http.createServer(app)
const io =new Server(server)


io.on('connection',(socket)=>{
    console.log('new connection',socket.id);
    socket.on('join-me',({id})=>{
        
        io.to(id).emit('newmember',{socketid:socket.id});
        socket.join(id);
        socket.emit('enter');
    });
    socket.on('giveentry',({id,peer})=>{
         console.log('theyIreceivedneewmemberallowed');
        setTimeout(()=>{
            console.log('theyIsentneewmemberallowed');
            socket.to(id).emit('allowed',{peer:peer})
        },2000);
    })
    socket.on('close', (data) => {
    
   
    io.to(data.id).emit('peer-left', { peerId: data.peerid });
  });
  socket.on('close-call',(data)=>{
    console.log( socket.to(data.data).emit('removepeer',{peer:data.peer,e:data.e}))

})
})


const PORT = process.env.PORT||3000;
server.listen(PORT, () => {
    console.log('Server is running on port ',PORT);
}
);



