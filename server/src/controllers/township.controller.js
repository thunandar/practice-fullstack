const { townshipPopulate } = require("../config/populate");
const townshipModel = require("../models/township.model");
const { validationResponse } = require("../utils/validationResponse");
const { TownshipSchema } = require("../validators/township.validate");

exports.list = async (req, res) => {
  try {
    let { region_id } = req.body;

    let township = await townshipModel.list(req.body);
    let total_count = await townshipModel.find({}).countDocuments();
    if (region_id != "all") {
      total_count = await townshipModel
        .find({ region_id: region_id })
        .countDocuments();
    }
    let transformedData = [];
    if (township.length > 0) {
      transformedData = township.map((data) => data.transform(data));
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
    const { error, value } = TownshipSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const township = new townshipModel(value);

      await township.save();

      return res.send({
        status: 0,
        message: "Township Created Successfully !",
      });
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
    const township = await townshipModel
      .findOne({ township_id: req.body.id })
      .populate(townshipPopulate)
      .exec();

    if (township) {
      return res.send({
        status: 0,
        data: township.transform(township, req.body?.lang),
      });
    } else {
      return res.send({
        status: 1,
        message: "township Not Found !",
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
    const { error, value } = TownshipSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const township = await townshipModel.findOneAndUpdate(
        { township_id: req.body.id },
        value,
        { returnOriginal: false }
      );

      if (township) {
        return res.send({
          status: 0,
          message: "Township Updated Successfully !",
        });
      } else {
        return res.send({
          status: 1,
          message: "Township Not Found !",
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

exports.delete = async (req, res) => {
  try {
    const township = await townshipModel.findOneAndDelete({
      township_id: req.body.id,
    });

    if (township) {
      return res.send({
        status: 0,
        message: "Township Deleted Successfully !",
      });
    }
    return res.send({
      status: 1,
      message: "Township Not Found !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
