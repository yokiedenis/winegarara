require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const session = require("express-session")
const mongoDbsession = require("connect-mongodb-session")(session)
const express = require("express");

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  // console.log("req.bodyreg",req.body)
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        email: newUser.email,
        userName: newUser.userName,
      },
      process.env.SECRET_KEY,
      { expiresIn: "60m" }
    );

    // Return the token and user details in the response
    res.status(200).json({
      success: true,
      message: "Registration successful",
      token, // Include the token in the response
      user: {
        email: newUser.email,
        role: newUser.role,
        id: newUser._id,
        userName: newUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
// console.log("req.body",req.body)
  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
     process.env.SECRET_KEY,
      { expiresIn: "60m" }
    );
   //creating a session base auth in database
    //session based auth
    // req.session.isAuth=true;
    // req.session.user={
    //     userId:checkUser.id,
    //     email:checkUser.email,
    //     username:checkUser.userName,
    // };
    //change secure to true when sending secure https
    //do this on secure
    // res.cookie("token", token, { httpOnly: true, secure: false }).json({
    //   success: true,
    //   message: "Logged in successfully",
    //   user: {
    //     email: checkUser.email,
    //     role: checkUser.role,
    //     id: checkUser._id,
    //     userName: checkUser.userName,
    //   },
    // });

    //do this in render dev
    res.status(200).json({
      success:true,
      message:"Logged in successfully",
      token,
      user: {
            email: checkUser.email,
            role: checkUser.role,
            id: checkUser._id,
            userName: checkUser.userName,
          },
    })
 
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  // req.session.destroy((err) => {
  //   if (err) {
  //     return res.status(500).json("logout unsucessful");
  //   } 
  // });
  // res.clearCookie("token").json({
  //   success: true,
  //   message: "Logged out successfully!",
  // });
  
};

//auth middleware
//for secure
// const authMiddleware = async (req, res, next) => {
//   // Check if session is authenticated
//   if (!req.session.isAuth) {
//     return res.status(401).json("Session expired, please login again");
//   }
//   const token = req.cookies.token;
//   if (!token)
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorised user!",
//     });

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: "Unauthorised user!",
//     });
//   }
  
// };

const authMiddleware = async (req, res, next) => {
  // Check if session is authenticated
  // if (!req.session.isAuth) {
  //   return res.status(401).json("Session expired, please login again");
  // }
  const authHeader = req.headers["authorization"];
  const token =authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
  
};


module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
