const userModel = require("../models/user.model");
const { validationResponse } = require("../utils/validationResponse");
const {
  userRegisterSchema,
  userLoginSchema,
  userPasswordUpdateSchema,
  ownerRegisterSchema,
  ownerLoginSchema,
  employeeLoginSchema,
} = require("../validators/auth.validator");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const { jwtToken, ownerStatus } = require("../config/vars");
const path = require("path");
const { uploadFile } = require("../utils/file");
const { adminLoginSchema } = require("../validators/admin.validate");
const adminModel = require("../models/admin.model");
const { getRandomNumbers } = require("../utils");
const {
  sendResetCodeMail,
  ownerEmailVerify,
} = require("../services/email/mailProvider");
const ownerModel = require("../models/owner.model");
const { deleteFile } = require("../config/s3");
const employeeModel = require("../models/employee.model");
const { userPopulate, ownerPopulate } = require("../config/populate");
const authProviders = require("../services/auth/authProvider");
const loginAttemptModel = require("../models/loginAttempt.model");

const handleLoginAttempt = async (req, res, userData) => {
  try {
    let loginAttempt;
    let remainingTime;

    const MAX_LOGIN_ATTEMPTS = process.env.MAX_LOGIN_ATTEMPTS;
    const LOGIN_ATTEMPT_WINDOW_MINUTES =  process.env.LOGIN_ATTEMPT_WINDOW_MINUTES;

    loginAttempt = await loginAttemptModel.findOne({
      device_id: req.body.device_id,
    });

    if (!loginAttempt) {
      loginAttempt = new loginAttemptModel({
        user_id: userData.user_id,
        device_id: req.body.device_id,
        login_attempt_count: 2,
        login_time: new Date(),
      });
    } else {
      loginAttempt.login_attempt_count += 1;

      const currentTime = new Date();

      const elapsedTimeSinceLastAttempt =
        (currentTime - loginAttempt.login_time) / (1000 * 60);

      remainingTime =
        LOGIN_ATTEMPT_WINDOW_MINUTES - elapsedTimeSinceLastAttempt;

      if (elapsedTimeSinceLastAttempt >= LOGIN_ATTEMPT_WINDOW_MINUTES) {
        loginAttempt.login_attempt_count = 0;
        loginAttempt.login_time = currentTime;
      }
    }

    await loginAttempt.save();

    if (loginAttempt.login_attempt_count >= MAX_LOGIN_ATTEMPTS) {
      return res.status(403).json({
        status: 1,
        message: `Maximum login attempts reached for this device. Please try again after ${Math.ceil(
          remainingTime
        )} minutes.`,
      });
    } else {
      return res.status(403).json({
        status: 1,
        message: "Invalid Credential !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.userRegister = async (req, res) => {
  try {
    const { error, value } = userRegisterSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const oldUser = await userModel.findOne({ email: value.email });

      if (oldUser) {
        return res.send({
          status: 1,
          message: "User Already Exist. Please Login",
        });
      }

      const encryptedPassword = await bcrypt.hash(value.password, 10);

      let avatar = gravatar.url(
        value.name,
        { s: "100", r: "x", d: "retro" },
        true
      );

      if (req.body.avatar) {
        let result = await uploadFile(req.body.avatar);

        if (result.status == 1) {
          return res.send(result);
        }

        avatar =
          req.protocol + "://" + req.get("host") + "/images/" + result.data.Key;
      }

      value.avatar = avatar;
      value.password = encryptedPassword;

      const user = new userModel(value);

      const payload = {
        user: {
          email: user.email,
        },
      };

      jwt.sign(
        payload,
        jwtToken,
        { expiresIn: "24h" },
        async (err, access_token) => {
          if (err) return err;

          user.access_token = access_token;

          await user.save();

          let loginAttempt = new loginAttemptModel({
            user_id: user.user_id,
            device_id: value.device_id,
            login_attempt_count: 1,
            login_time: new Date(),
          });

          await loginAttempt.save();

          return res.send({
            status: 0,
            message: "User Register Successfully !",
            user: {
              id: user.user_id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatar: user.avatar,
            },
          });
        }
      );
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.userLogin = async (req, res) => {
  try {
    if (req.body.login_type == 0) {
      const googleResData = await authProviders.googleAccessToken(
        req.body.access_token
      );

      return res.send(googleResData);

      // if(googleResData.status == 0) {
      //     req.body.accessToken = googleResData.data.access_token;
      // } else {
      //     return res.json(googleResData);
      // }
    }

    const { error, value } = userLoginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const userData = await userModel
        .findOne({ email: value.email })
        .populate(userPopulate);

      if (userData) {
        const isMatch = await bcrypt.compare(value.password, userData.password);

        if (isMatch) {
          const payload = {
            user: {
              email: userData.email,
            },
          };

          jwt.sign(
            payload,
            jwtToken,
            { expiresIn: "24h" },
            async (err, access_token) => {
              if (err) return err;

              userData.access_token = access_token;
              await userData.save();

              user = userData.transform();

              res.status(200).json({
                status: 0,
                message: "User Login Successfully !",
                user,
                access_token,
              });
            }
          );
        } else {
          await handleLoginAttempt(req, res, userData);
        }
      } else {
        return res.send({
          status: 1,
          message: "User doesn't exist",
        });
      }
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.authUser = async (req, res) => {
  try {
    if (req.body.access_token) {
      let user = await userModel
        .findOne({ access_token: req.body.access_token })
        .populate(userPopulate);

      if (user) {
        user = user.transform(user);

        return res.send({
          status: 0,
          user,
        });
      } else {
        return res.send({
          status: 1,
          message: "User Not Found !",
        });
      }
    } else {
      return res.send({
        status: 1,
        message: "Access Token is required",
      });
    }
  } catch (err) {
    return res.send({
      status: 1,
      message: err.message,
    });
  }
};

exports.authOwner = async (req, res) => {
  try {
    if (req.body.access_token) {
      let owner = await ownerModel.findOne({
        access_token: req.body.access_token,
      });

      if (owner) {
        owner = owner.transform(owner);

        return res.send({
          status: 0,
          owner,
        });
      } else {
        return res.send({
          status: 1,
          message: "Invalid Token",
          is_login: true,
        });
      }
    } else {
      return res.send({
        status: 1,
        message: "Access Token is required",
      });
    }
  } catch (err) {
    return res.send({
      status: 1,
      message: err.message,
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { error, value } = adminLoginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const adminData = await adminModel.findOne({ email: value.email });

      if (adminData) {
        const isMatch = await bcrypt.compare(
          value.password,
          adminData.password
        );

        if (isMatch) {
          const payload = {
            admin: {
              email: adminData.email,
            },
          };

          jwt.sign(
            payload,
            jwtToken,
            { expiresIn: "24h" },
            async (err, access_token) => {
              if (err) return err;

              adminData.access_token = access_token;
              await adminData.save();

              admin = adminData.transform();

              res.status(200).json({
                status: 0,
                message: "Admin Login Successfully !",
                admin,
                access_token,
              });
            }
          );
        } else {
          return res.send({
            status: 1,
            message: "Invalid Credential !",
          });
        }
      } else {
        return res.send({
          status: 1,
          message: "Admin doesn't exist",
        });
      }
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.ownerRegister = async (req, res) => {
  try {
    const { error, value } = ownerRegisterSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const oldOwner = await ownerModel.findOne({
        $or: [
          { email: value.email },
          { phone: value.phone },
          { nrc_no: value.nrc_no },
        ],
      });

      if (oldOwner) {
        if (!oldOwner.is_email_verified) {
          const code = getRandomNumbers();

          let data = {
            name: oldOwner.name,
            email: oldOwner.email,
            code: code.toString().slice(0, 4),
          };

          await ownerEmailVerify(data);

          oldOwner.verify_code = code.toString().slice(0, 4);

          await oldOwner.save();

          return res.send({
            status: 0,
            message: "Sent owner verify !",
          });
        }

        return res.send({
          status: 1,
          message: "Owner Already Exist. Please Login",
        });
      }

      let avatar = gravatar.url(
        value.name,
        { s: "100", r: "x", d: "retro" },
        true
      );

      if (req.body.avatar) {
        let result = await uploadFile(req.body.avatar);

        if (result.status == 1) {
          return res.send(result);
        }

        avatar =
          req.protocol + "://" + req.get("host") + "/images/" + result.data.Key;
      }

      value.avatar = avatar;

      value.tags = value.tag_ids;

      value.status = ownerStatus.pending;

      if (req.body.nrc_front) {
        let result = await uploadFile(req.body.nrc_front);

        if (result.status == 1) {
          return res.send(result);
        }

        value.nrc_front =
          req.protocol + "://" + req.get("host") + "/images/" + result.data.Key;
      }

      if (req.body.nrc_back) {
        let result = await uploadFile(req.body.nrc_back);

        if (result.status == 1) {
          return res.send(result);
        }

        value.nrc_back =
          req.protocol + "://" + req.get("host") + "/images/" + result.data.Key;
      }

      if (req.body.business_logo) {
        let result = await uploadFile(req.body.business_logo);

        if (result.status == 1) {
          return res.send(result);
        }

        value.business_logo =
          req.protocol + "://" + req.get("host") + "/images/" + result.data.Key;
      }

      const owner = new ownerModel(value);

      const code = getRandomNumbers();
      let data = {
        name: owner.name,
        email: owner.email,
        code: code.toString().slice(0, 4),
      };
      await ownerEmailVerify(data);

      owner.verify_code = code.toString().slice(0, 4);

      await owner.save();

      return res.send({
        status: 0,
        owner_status: ownerStatus.pending,
        message: "Verify code sent !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.ownerEmailVerifyCode = async (req, res) => {
  try {
    let acc = await ownerModel.findOne({ email: req.body.email });

    if (!acc) {
      return res.send({
        status: 1,
        message: "Your account doesn't exist",
      });
    }

    const currentDatetime = new Date();
    const updatedTime = new Date(acc.updatedAt);

    const timeDifferenceMs = currentDatetime - updatedTime;

    const oneSecondInMs = 1000;
    const oneMinuteInMs = 60 * oneSecondInMs;
    const oneHourInMs = 60 * oneMinuteInMs;

    const minutes = Math.floor(
      (timeDifferenceMs % oneHourInMs) / oneMinuteInMs
    );

    if (acc.verify_code != req.body.code || minutes > 0) {
      if (acc.avatar) {
        const key = path.basename(acc.avatar);
        await deleteFile(key);
      }

      if (acc.business_logo) {
        const key = path.basename(acc.business_logo);
        await deleteFile(key);
      }

      if (acc.nrc_front) {
        const key = path.basename(acc.nrc_front);
        await deleteFile(key);
      }

      if (acc.nrc_back) {
        const key = path.basename(acc.nrc_back);
        await deleteFile(key);
      }

      await ownerModel.findOneAndDelete({ email: req.body.email });

      return res.send({
        status: 1,
        message:
          "Code doesn't match and your registeration failed , Please create again !",
      });
    }

    acc.verify_code = null;
    acc.is_email_verified = true;

    await acc.save();

    return res.send({
      status: 0,
      access_token: acc.access_token,
      message: "Success Verification !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.ownerLogin = async (req, res) => {
  try {
    const { error, value } = ownerLoginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const ownerData = await ownerModel
        .findOne({ email: value.email, nrc_no: value.nrc_no })
        .populate(ownerPopulate);

      if (ownerData) {
        if (!ownerData.is_email_verified) {
          return res.send({
            status: 1,
            message: "Owner Email was not verify!",
          });
        }

        if (ownerData.status == ownerStatus.pending) {
          return res.send({
            status: 0,
            owner_status: ownerStatus.pending,
            message:
              "Your account is pending, we will connect you during 48hrs !",
          });
        }

        if (ownerData.status == ownerStatus.blocked) {
          return res.send({
            status: 0,
            owner_status: ownerStatus.blocked,
            message:
              "Your account was blocked due to some policy , Please connect to our contact .",
          });
        }

        if (ownerData.status == ownerStatus.failed) {
          return res.send({
            status: 0,
            owner_status: ownerStatus.failed,
            message:
              "Your account creation failed due to some data , Please provide real data .",
          });
        }

        const isMatch = await bcrypt.compare(
          value.password,
          ownerData.password
        );

        if (isMatch) {
          const payload = {
            owner: {
              email: ownerData.email,
            },
          };

          jwt.sign(
            payload,
            jwtToken,
            { expiresIn: "24h" },
            async (err, access_token) => {
              if (err) return err;

              ownerData.access_token = access_token;
              await ownerData.save();

              owner = ownerData.transform();

              res.status(200).json({
                status: 0,
                message: "Owner Login Successfully !",
                owner,
                access_token,
              });
            }
          );
        } else {
          return res.send({
            status: 1,
            message: "Invalid Credential !",
          });
        }
      } else {
        return res.send({
          status: 1,
          message: "Invalid Credential !",
        });
      }
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let acc;

    if (req.body.account == "owner") {
      acc = await ownerModel.findOne({ email: req.body.email });
    } else if (req.body.account == "user") {
      acc = await userModel.findOne({ email: req.body.email });
    } else {
      acc = await employeeModel.findOne({ email: req.body.email });
    }

    if (acc) {
      const code = getRandomNumbers();
      let data = {
        name: acc.name,
        email: acc.email,
        code: code.toString().slice(0, 4),
      };
      await sendResetCodeMail(data);

      acc.verify_code = code.toString().slice(0, 4);

      await acc.save();

      return res.send({
        status: 0,
        message:
          "Verify Code was sent to account email , Please verify during one minutes .",
      });
    } else {
      return res.send({
        status: 1,
        message: "Your email doesn't exist",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    let acc;

    if (req.body.account == "owner") {
      acc = await ownerModel.findOne({ email: req.body.email });
    } else if (req.body.account == "user") {
      acc = await userModel.findOne({ email: req.body.email });
    } else {
      acc = await employeeModel.findOne({ email: req.body.email });
    }

    if (!acc) {
      return res.send({
        status: 1,
        message: "Your email doesn't exist",
      });
    }

    if (acc.verify_code !== req.body.code) {
      return res.send({
        status: 1,
        message: "Code doesn't match !",
      });
    }

    const currentDatetime = new Date();
    const updatedTime = new Date(acc.updatedAt);

    const timeDifferenceMs = currentDatetime - updatedTime;

    const oneSecondInMs = 1000;
    const oneMinuteInMs = 60 * oneSecondInMs;
    const oneHourInMs = 60 * oneMinuteInMs;

    const minutes = Math.floor(
      (timeDifferenceMs % oneHourInMs) / oneMinuteInMs
    );

    if (minutes > 0) {
      return res.send({
        status: 1,
        message: "Your Verify Code was expired !",
      });
    }

    acc.verify_code = null;
    acc.is_email_verified = true;

    await acc.save();

    return res.send({
      status: 0,
      access_token: acc.access_token,
      message: "Success Verification !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { error, value } = userPasswordUpdateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      let acc;

      if (req.body.account == "owner") {
        acc = await ownerModel.findOne({ email: req.body.email });
      } else if (req.body.account == "user") {
        acc = await userModel.findOne({ email: req.body.email });
      } else {
        acc = await employeeModel.findOne({ email: req.body.email });
      }

      if (!acc) {
        return res.send({
          status: 1,
          message: "Account doesn't exist",
        });
      }

      if (acc.verify_code != null) {
        return res.send({
          status: 1,
          message: "Please verify code first !",
        });
      }

      const encryptedPassword = await bcrypt.hash(value.password, 10);

      acc.password = encryptedPassword;
      acc.access_token = null;

      await acc.save();
      return res.send({
        status: 0,
        message: "Account Password Updated Successfully !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.employeeLogin = async (req, res) => {
  try {
    const { error, value } = employeeLoginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const employeeData = await employeeModel.findOne({
        email: value.email,
        is_access_court: true,
      });

      if (!employeeData) {
        return res.send({
          status: 1,
          message: "Employee doesn't exist",
        });
      }

      const ownerData = await ownerModel.findOne({
        owner_id: employeeData.owner_id,
      });

      if (!ownerData) {
        return res.send({
          status: 1,
          message: "Owner doesn't exist",
        });
      }

      if (ownerData.status == ownerStatus.pending) {
        return res.send({
          status: 0,
          owner_status: ownerStatus.pending,
          message:
            "Owner account is pending, we will connect you during 48hrs !",
        });
      }

      if (ownerData.status == ownerStatus.blocked) {
        return res.send({
          status: 0,
          owner_status: ownerStatus.blocked,
          message:
            "Owner account was blocked due to some policy , Please connect to our contact .",
        });
      }

      if (ownerData.status == ownerStatus.failed) {
        return res.send({
          status: 0,
          owner_status: ownerStatus.failed,
          message:
            "Owner account creation failed due to some data , Please provide real data .",
        });
      }

      const isMatch = await bcrypt.compare(
        value.password,
        employeeData.password
      );

      if (isMatch) {
        const payload = {
          employee: {
            email: employeeData.email,
          },
        };

        jwt.sign(
          payload,
          jwtToken,
          { expiresIn: "24h" },
          async (err, access_token) => {
            if (err) return err;

            employeeData.access_token = access_token;
            await employeeData.save();

            let employee = employeeData.transform();
            delete employee.courts;
            delete employee.owner;
            res.status(200).json({
              status: 0,
              message: "Employee Login Successfully !",
              employee,
              owner_id: ownerData.owner_id,
              access_token,
            });
          }
        );
      } else {
        return res.send({
          status: 1,
          message: "Invalid Credential !",
        });
      }
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
