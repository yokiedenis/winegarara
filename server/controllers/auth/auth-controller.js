require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const session = require("express-session")
const mongoDbsession = require("connect-mongodb-session")(session)
const express = require("express");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  console.log("req.bodyreg",req.body)
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
console.log("req.body",req.body)
  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log("check",normalizedEmail)
const checkUser = await User.findOne({ email: normalizedEmail });
    console.log("check",checkUser)
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    console.log("checkp",checkPasswordMatch)
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


// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, a reset link will be sent.",
      });
    }

    // Generate and hash token
    const token = crypto.randomBytes(20).toString('hex');
    const hashedToken = await bcrypt.hash(token, parseInt(process.env.SALT));
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.VITE_API_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Password reset email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error processing your request.",
    });
  }
};


// Reset Password
const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Validate token and expiry
    if (
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      Date.now() > user.resetPasswordExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, parseInt(process.env.SALT));
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error resetting password.",
    });
  }
};

module.exports = {resetPassword, forgotPassword,registerUser, loginUser, logoutUser, authMiddleware };
