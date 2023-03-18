require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

const url = process.env.DATABASE_URL;

mongoose.connect(url, {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String
});

var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/register", function(req, res) {
  res.sendFile(__dirname + "/register.html");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username
  });
  newUser.save().then(function(user, err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Saved Successfully");
      res.redirect("/login");
    }
  })
});

app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", function(req, res) {
  const userName = req.body.username;
  const passWord = req.body.password;
  User.findOne({
    username: userName
  }).then(function(user, err) {
      if(user){
        if(user.password === passWord){
          console.log("login Successfull");
        } else {
          console.log("wrong password");
        }
      } else {
        console.log(err);
      }
  });
});

app.get("/forgot-password",function(req,res){
  res.sendFile(__dirname + "/forgot.html");
});

app.listen(3000, function() {
  console.log("Server started at port 3000");
});
