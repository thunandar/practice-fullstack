const adminModel = require("../models/admin.model");
const gravatar = require("gravatar");
const { uploadFile } = require("../utils/file");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtToken } = require("../config/vars");
const path = require("path");
const {
  adminRegisterSchema,
  adminUpdateSchema,
} = require("../validators/admin.validate");
const { deleteFile } = require("../config/s3");
const { validationResponse } = require("../utils/validationResponse");

exports.list = async (req, res) => {
  try {
    const admin = await adminModel.list(req.body);
    const total_count = await adminModel.find({}).countDocuments();
    let transformedData = [];
    if (admin.length > 0) {
      transformedData = admin.map((data) => data.transform(data));
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { error, value } = adminRegisterSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const oldAdmin = await adminModel.findOne({ email: value.email });

      if (oldAdmin) {
        return res.send({
          status: 1,
          message: "Admin Already Exist. Please Login",
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

      const admin = new adminModel(value);

      const payload = {
        admin: {
          email: admin.email,
        },
      };

      jwt.sign(
        payload,
        jwtToken,
        { expiresIn: "24h" },
        async (err, access_token) => {
          if (err) return err;

          admin.access_token = access_token;

          await admin.save();

          return res.send({
            status: 0,
            message: "Admin Created Successfully !",
            admin: {
              id: admin.admin_id,
              name: admin.name,
              email: admin.email,
              phone: admin.phone,
              role: admin.role,
              avatar: admin.avatar,
            },
            access_token,
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

exports.detail = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ admin_id: req.body.id });

    if (admin) {
      return res.send({
        status: 0,
        data: admin.transform(admin),
      });
    } else {
      return res.send({
        status: 1,
        message: "Admin Not Found !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { error, value } = adminUpdateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const filter = { admin_id: value.id };

      let admin = await adminModel.findOne(filter);

      if (!admin) {
        return res.send({
          status: 1,
          message: "Admin Not Found !",
        });
      }

      const oldAdmin = await adminModel.find({ email: value.email });

      if (oldAdmin.length > 1) {
        return res.send({
          status: 1,
          message: "Admin Already Exist. Please Login",
        });
      }

      let avatar = gravatar.url(
        value.name,
        { s: "100", r: "x", d: "retro" },
        true
      );

      if (req.body.avatar) {
        if (!req.body.avatar.startsWith("http")) {
          let result = await uploadFile(req.body.avatar);

          if (result.status == 1) {
            return res.send(result);
          }

          avatar =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/" +
            result.data.Key;

          if (admin.avatar) {
            const key = path.basename(admin.avatar);
            await deleteFile(key);
          }
        } else {
          avatar = req.body.avatar;
        }
      }

      value.avatar = avatar;

      if (value.password) {
        const encryptedPassword = await bcrypt.hash(value.password, 10);
        value.password = encryptedPassword;
      }

      const payload = {
        admin: {
          email: admin.email,
        },
      };

      jwt.sign(
        payload,
        jwtToken,
        { expiresIn: "24h" },
        async (err, access_token) => {
          if (err) return err;

          value.access_token = access_token;

          let adminData = await adminModel.findOneAndUpdate(filter, value, {
            returnOriginal: false,
          });

          return res.send({
            status: 0,
            message: "Admin Updated Successfully !",
            admin: {
              id: adminData.admin_id,
              name: adminData.name,
              email: adminData.email,
              phone: adminData.phone,
              role: adminData.role,
              avatar: adminData.avatar,
            },
            access_token,
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

exports.delete = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ admin_id: req.body.id });

    if (admin) {
      if (admin.avatar) {
        const key = path.basename(admin.avatar);
        await deleteFile(key);
      }

      await adminModel.findOneAndDelete({ admin_id: req.body.id });

      return res.send({
        status: 0,
        message: "Admin Deleted Successfully !",
      });
    } else {
      return res.send({
        status: 1,
        message: "Admin Not Found !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
