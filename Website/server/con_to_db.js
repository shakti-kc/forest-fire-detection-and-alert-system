
const mongoose = require("mongoose");

const DB = 'mongodb+srv://mongodb_username:mongodb_password@cluster0.kgkdlfo.mongodb.net/fire_detection?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(DB).then(()=>{
  console.log("Connected To Database");
}).catch((err)=>{
  console.log(err);
});
 