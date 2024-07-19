const { UserDefaultDetailsSchema } = require("../validators/user.validate");
const { validationResponse } = require("../utils/validationResponse");
const userModel = require("../models/user.model");
const { userPopulate } = require("../config/populate");
const path = require("path");
const { deleteFileFromS3 } = require("../config/s3");
const { uploadFile } = require("../utils/file");
const gravatar = require("gravatar");

exports.registerDefaultUserDetails = async (req, res) => {
  try {
    const { error, value } = UserDefaultDetailsSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      let filter = { access_token: value.access_token };

      value.tags = value.tag_ids;
      value.is_update_default_data = true;

      await userModel.findOneAndUpdate(filter, value, {
        returnOriginal: false,
      });

      return res.send({
        status: 0,
        message: "User Info Updated Successfully !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const users = await userModel.list(req.body);
    const total_count = await userModel.find({}).countDocuments();
    let transformedData = [];
    if (users.length > 0) {
      transformedData = users.map((data) => data.transform(data));
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

exports.search = async (req, res) => {
  try {
    const { value, page, per_page } = req.body;
    let regex = new RegExp(value, "i");
    let filter = {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
      ],
    };

    const users = await userModel
      .find(filter)
      .populate(userPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    const total_count = await userModel.find(filter).countDocuments();

    let transformedData = [];

    if (users.length > 0) {
      transformedData = users.map((data) => data.transform(data));
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

exports.userUpdate = async (req, res) => {
  try {
    const { name, email, phone, user_id } = req.body;

    const filter = { user_id: user_id };

    const user = await userModel.findOne(filter);

    if (user) {
      let avatar = gravatar.url(name, { s: "100", r: "x", d: "retro" }, true);

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

          if (user.avatar) {
            const key = path.basename(user.avatar);
            await deleteFileFromS3(key);
          }
        } else {
          avatar = req.body.avatar;
        }
      }

      await userModel.findOneAndUpdate(
        filter,
        { name: name, email: email, phone: phone, avatar: avatar },
        {
          returnOriginal: false,
        }
      );

      return res.send({
        status: 0,
        message: "User Updated Successfully !",
      });
    } else {
      return res.send({
        status: 1,
        message: "User Not Found !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
