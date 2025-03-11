require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session")
const mongoDbsession = require("connect-mongodb-session")(session)
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//file imports
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const User = require("./models/User"); // Adjust path as needed
//constants
const app = express();
const PORT = process.env.PORT || 5000;
const store = new mongoDbsession({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for session
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);


//create a database connection 
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));


app.use(
  cors({
    origin:process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
    optionSuccessStatus: 200
  })
);


// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
      user: "yokasdenis@gmail.com",
      pass: "cdin napn jenw aaxu",
  }
});

// Forgot Password Route
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
console.log("ricnmorty",req.body)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Save token to user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
        <p>This link will expire in 1 hour</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

// Reset Password Route
app.post('/api/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});


//api
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/common/feature", commonFeatureRouter);



app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));