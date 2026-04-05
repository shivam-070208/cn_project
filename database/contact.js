const mongoose = require('mongoose');


const contactschema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    }
})


const Contactmodel = mongoose.model('contact',contactschema);
module.exports = Contactmodel;