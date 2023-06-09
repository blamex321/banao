require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const app = express();

let otp = "";

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
  }
});


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
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ['password']
});

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
    if (user) {
      if (user.password === passWord) {
        console.log("login Successfull");
        res.redirect("/authenticated");
      } else {
        console.log("wrong password");
        res.redirect("/login");
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/forgot-password", function(req, res) {
  res.sendFile(__dirname + "/forgot.html");
});

app.post("/forgot-password", function(req, res) {
  User.findOne({
    email: req.body.email
  }).then(function(user, err) {
    if (user) {
      res.sendFile(__dirname + "/otp.html");
      otp = otpGenerator.generate(6,{upperCaseAlphabets:false, specialChars: false, lowerCaseAlphabets:false});
      var mailOptions = {
        from: 'youremail@gmail.com',
        to: req.body.email,
        subject: 'OTP for Password Reset',
        text: 'Hello There',
        html: "hello,<br> Please find OTP to login to your account: <br>" + otp, // html body
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } else {
      res.send("user not found, register first");
    }
  });
});

app.post("/auth",function(req,res){
  if(otp === req.body.otp){
    console.log("Login Successfull");
    res.redirect("/authenticated");
  } else {
    console.log("Entered OTP is incorrect");
    res.redirect("/forgot-password");
  }
});

app.get("/authenticated",function(req,res){
  res.sendFile(__dirname + "/inside.html");
});

app.listen(3000|| process.env.PORT, function() {
  console.log("Server started at port 3000");
});
