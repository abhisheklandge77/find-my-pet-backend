const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./userModel/userModel");
const auth = require("./middleware/auth");
const mailBody = require("./mailBody");
const nodemailer = require("nodemailer");

const { MONGODB_URI } = process.env;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FIND_MY_PET_EMAIL, // generated ethereal user
    pass: process.env.FIND_MY_PET_EMAIL_PASSWORD, // generated ethereal password
  },
});

db.on("open", function () {
  console.log("Connected to database successfully...");
});

db.on("error", function () {
  console.error.bind(console, "Connection Error !");
});

router.get("/", (req, res) => {
  res.send("mongodb database is working...");
});

router.post("/register", async (req, res) => {
  try {
    // Get user input
    const { name, email, password } = req.body;
    console.log("USer Data:::", name, email, password);

    // Validate user input
    if (!(email && password && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.send("User Already Exist");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    const htmlBody = mailBody.getRegisterMail(name);
    const mailOptions = {
      from: process.env.FIND_MY_PET_EMAIL, // sender address
      to: email, // list of receivers
      subject: "Account created successfully", // Subject line
      html: htmlBody, // html body
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error =>", err);
      } else {
        console.log("Mail send successfully", data);
      }
    });

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});
router.post("/google-signin", async (req, res) => {
  try {
    // Get user input
    const { name, email, fromGoogle } = req.body;
    console.log("USer Data:::", name, email);

    // Validate user input
    if (!(email && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(200).json(oldUser);
    }

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      fromGoogle,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    const htmlBody = mailBody.getRegisterMail(name);
    const mailOptions = {
      from: process.env.FIND_MY_PET_EMAIL, // sender address
      to: email, // list of receivers
      subject: "Account created successfully", // Subject line
      html: htmlBody, // html body
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error =>", err);
      } else {
        console.log("Mail send successfully", data);
      }
    });

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

router.use("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });
    if (!user) {
      res.send("User does not exist");
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    } else {
      res.send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

router.use("/contact", async (req, res) => {
  try {
    // Get user input
    const { name, email } = req.body;

    // Validate user input
    if (!(email && name)) {
      res.status(400).send("All input is required");
    }

    const htmlBody = mailBody.getContactMail(name);
    const mailOptions = {
      from: process.env.FIND_MY_PET_EMAIL, // sender address
      to: email, // list of receivers
      subject: "Thanks for contacting us", // Subject line
      html: htmlBody, // html body
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error =>", err);
      } else {
        console.log("Contact mail send successfully");
      }
    });

    // return new user
    res.status(201).send("Send contact mail successfully");
  } catch (err) {
    console.log(err);
  }
});

router.use("/lostPetMail", async (req, res) => {
  try {
    // Get user input
    const {
      petId,
      personName,
      personEmail,
      personAddress,
      personPhone,
      personMessage,
      ownerName,
      ownerEmail,
      petName,
      latitude,
      longitude,
    } = req.body;

    // Validate user input
    if (!(personEmail && personName && ownerEmail)) {
      res.status(400).send("All input is required");
    }
    const payload = {
      petId,
      personName,
      personEmail,
      personAddress,
      personPhone,
      personMessage,
      petName,
      ownerName,
      latitude,
      longitude,
    };

    const htmlBody = mailBody.getLostPetMail(payload);
    const mailOptions = {
      from: process.env.FIND_MY_PET_EMAIL, // sender address
      to: ownerEmail, // list of receivers
      subject: `${petName} might have found to ${personName}`, // Subject line
      html: htmlBody, // html body
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error =>", err);
      } else {
        console.log("Pet  lost mail send successfully");
      }
    });

    const htmlBody2 = mailBody.getHelpingMail(payload);
    const mailOptions2 = {
      from: process.env.FIND_MY_PET_EMAIL, // sender address
      to: personEmail, // list of receivers
      subject: `Hey ${personName}, Thanks for helping`, // Subject line
      html: htmlBody2, // html body
    };
    transporter.sendMail(mailOptions2, (err, data) => {
      if (err) {
        console.log("Error =>", err);
      } else {
        console.log("thanking mail send successfully");
      }
    });

    // return new user
    res.status(201).send("Send pet lost mail successfully");
  } catch (err) {
    console.log(err);
  }
});

router.use("/placedOrderMail", async (req, res) => {
  try {
    // Get user input
    const { orderDetails, name, email, paymentMethod } = req.body;

    // Validate user input
    if (!(name && email && orderDetails)) {
      res.status(400).send("All input is required");
    }
    const payload = {
      orderDetails,
      name,
      paymentMethod,
    };

    const htmlBody = mailBody.placedOrderMail(payload);
    const mailOptions = {
      from: process.env.FIND_MY_PET_EMAIL, // sender address
      to: email, // list of receivers
      subject: `Your order placed successfully`, // Subject line
      html: htmlBody, // html body
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error =>", err);
      } else {
        console.log("Order mail send successfully");
      }
    });

    // return new user
    res.status(201).send("Order mail send successfully");
  } catch (err) {
    console.log(err);
  }
});

router.get("/getAllUsers", auth, (req, res) => {
  User.find({}).exec(function (err, data) {
    if (err) {
      console.log("Error: ", err);
    } else {
      const response = {
        ...data,
        count: data.length,
      };
      res.send(response);
    }
  });
});

router.get("/getUserById", (req, res) => {
  User.findById(req.query.id, function (err, data) {
    if (err) {
      console.log("Error: ", err);
      res.status(404).send("User Not Found !");
    } else {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send("User Not Found !");
      }
    }
  });
});

router.post("/updateUser", (req, res) => {
  const { name, email, phone, address, userImage } = req.body;
  User.findByIdAndUpdate(
    req.body.id,
    {
      name,
      email,
      phone,
      address,
      userImage,
    },
    function (err, data) {
      if (err) {
        console.log(error);
      } else {
        res.send(data);
      }
    }
  );
});

router.post("/savePet", function (req, res) {
  User.findByIdAndUpdate(
    req.body.id,
    {
      $addToSet: {
        pets: req.body.pet,
      },
    },
    function (err, data) {
      if (err) {
        console.log(error);
      } else {
        res.send(data);
      }
    }
  );
});

router.post("/deletePet", function (req, res) {
  User.findByIdAndUpdate(
    req.body.id,
    {
      $pull: {
        pets: req.body.pet,
      },
    },
    function (err, data) {
      if (err) {
        console.log(error);
      } else {
        res.send(data);
      }
    }
  );
});

router.post("/deleteUser", auth, (req, res) => {
  User.findByIdAndDelete(req.body.id, function (err, data) {
    if (err) {
      console.log("Error: ", err);
    } else {
      res.send(data);
    }
  });
});

module.exports = router;
