const User = require("../../models/User");
const UserWebinar = require("../../models/UserWebinar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var mongoose = require("mongoose");
let ObjectId = mongoose.Types.ObjectId;

module.exports = {
  login: async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        console.log(req.body.password, user);
        const compareStatus = await bcrypt.compare(
          req.body.password,
          user.password
        );
        console.log(compareStatus);
        if (compareStatus) {
          const token = jwt.sign(
            { email: user.email, userId: user._id },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          );
          res.json({
            status: {
              message: "login successfully",
              code: 200,
            },
            data: {
              token: token,
              expiresIn: 3600,
              userId: user._id,
            },
          });
        } else {
          return res.status(401).json({
            status: {
              message: "Auth Failed",
              code: 401,
            },
          });
        }
      } else {
        return res.status(401).json({
          status: {
            message: "User Don't exists",
            code: 401,
          },
        });
      }
    } catch (e) {
      console.log("error", e);
      res.status(500).json({
        status: {
          error: e,
          message: e.message,
          code: 500,
        },
      });
    }
  },
  signup: async (req, res, next) => {
    try {
      //const hash = await bcrypt.hash(req.body.password, 10);
      // console.log(hash);

      let user = null;

      user = await User.findOne({ mobile: req.body.mobile });

      if (!user) {
        user = new User({
          email: req.body.email,
          name: req.body.name,
          mobile: req.body.mobile,
          referral_code: req.body.referral_code,
          // password: hash
        });
        user = await user.save();
      }

      if (req.body.webinarId) {
        await UserWebinar.create({
          userId: user._id,
          webinarId: ObjectId(req.body.webinarId)
        });
      }

      console.log(user);
      res.json({
        status: {
          message: "user create successfully",
          code: 201,
        },
        data: user,
      });
    } catch (e) {
      console.log("error", e);
      res.status(500).json({
        status: {
          error: e,
          message: e.message,
          code: 500,
        },
      });
    }
  },
};
