const courtModel = require("../models/court.model");
const bookingModel = require("../models/booking.model");
const { uploadFile } = require("../utils/file");
const { validationResponse } = require("../utils/validationResponse");
const { CourtSchema } = require("../validators/court.validate");
const path = require("path");
const ownerModel = require("../models/owner.model");
const adminModel = require("../models/admin.model");
const { deleteFileFromS3 } = require("../config/s3");
const employeeModel = require("../models/employee.model");
const { courtPopulate } = require("../config/populate");
const userModel = require("../models/user.model");

exports.list = async (req, res) => {
  try {
    let ownerData = await ownerModel.findOne({
      access_token: req.body.access_token,
    });

    if (!ownerData) {
      return res.send({
        status: 1,
        message: "Invalid Token",
        is_login: true,
      });
    }

    req.body.owner_id = ownerData.owner_id;

    const court = await courtModel.list(req.body);
    const total_count = await courtModel
      .find({ owner_id: req.body.owner_id })
      .countDocuments();

    let transformedData = [];

    if (court.length > 0) {
      transformedData = court.map((data) => data.transform(data));
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
    const { error, value } = CourtSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const owner = await ownerModel.findOne({
        access_token: req.body.access_token,
      });

      if (!owner) {
        return res.send({
          status: 1,
          message: "Invalid Token",
          is_login: true,
        });
      }

      // if(owner.status == ownerStatus.pending){
      //     return res.send({
      //         status: 1,
      //         message: "Owner is not approved !"
      //     })
      // }

      // if(owner.status == ownerStatus.blocked){
      //     return res.send({
      //         status: 1,
      //         message: "Owner was blocked !"
      //     })
      // }

      // if(owner.status == ownerStatus.failed){
      //     return res.send({
      //         status: 1,
      //         message: "Owner was failed !"
      //     })
      // }

      const courtCount = await courtModel
        .find({ owner_id: owner.owner_id })
        .countDocuments();

      if (courtCount >= owner.court_limit) {
        return res.send({
          status: 1,
          message: "Court limit exceed ! please buy new plan",
        });
      }

      value.owner_id = owner.owner_id;

      let images = [];
      if (req.body.images) {
        for (let i = 0; i < req.body.images.length; i++) {
          let result = await uploadFile(req.body.images[i]);

          if (result.status == 1) {
            return res.send(result);
          }
          images = [
            ...images,
            req.protocol +
              "://" +
              req.get("host") +
              "/images/" +
              result.data.Key,
          ];
        }
      }

      value.images = images;

      const court = new courtModel(value);

      await court.save();

      return res.send({
        status: 0,
        message: "Court Created Successfully !",
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
    const court = await courtModel
      .findOne({ court_id: req.body.id })
      .populate(courtPopulate);

    if (court) {
      return res.send({
        status: 0,
        data: court.transform(court),
      });
    } else {
      return res.send({
        status: 1,
        message: "Court Not Found !",
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
    const { error, value } = CourtSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const court = await courtModel.findOne({ court_id: req.body.id });

      if (!court) {
        return res.send({
          status: 1,
          message: "Court Not Found",
        });
      }

      // const courtOwner = await checkOwner(req.body.access_token, court.owner)

      // if(courtOwner.status != 0){
      //     return res.send(courtOwner)
      // }

      const owner = await ownerModel.findOne({
        access_token: req.body.access_token,
      });

      if (!owner) {
        return res.send({
          status: 1,
          message: "Invalid Token",
          is_login: true,
        });
      }

      // if(owner.status == ownerStatus.pending){
      //     return res.send({
      //         status: 1,
      //         message: "Owner is not approved !"
      //     })
      // }

      // if(owner.status == ownerStatus.blocked){
      //     return res.send({
      //         status: 1,
      //         message: "Owner was blocked !"
      //     })
      // }

      // if(owner.status == ownerStatus.failed){
      //     return res.send({
      //         status: 1,
      //         message: "Owner was failed !"
      //     })
      // }

      value.owner_id = owner.owner_id;

      let images = [];

      if (req.body.images) {
        for (let i = 0; i < req.body.images.length; i++) {
          if (!req.body.images[i].startsWith("http")) {
            let result = await uploadFile(req.body.images[i]);

            if (result.status == 1) {
              return res.send(result);
            }
            images = [
              ...images,
              req.protocol +
                "://" +
                req.get("host") +
                "/images/" +
                result.data.Key,
            ];
            if (court.images[i]) {
              const key = path.basename(court.images[i]);
              await deleteFileFromS3(key);
            }
          } else {
            images = [...images, court.images[i]];
          }
        }
      }

      value.images = images;

      await courtModel.findOneAndUpdate({ court_id: req.body.id }, value, {
        returnOriginal: false,
      });

      return res.send({
        status: 0,
        message: "Court Updated Successfully !",
      });
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
    const court = await courtModel.findOne({ court_id: req.body.id });

    if (court) {
      // const courtOwner = await checkOwner(req.body.access_token, court.owner)

      // if(courtOwner.status != 0){
      //     return res.send(courtOwner)
      // }

      if (court.images) {
        for (let i = 0; i < court.images.length; i++) {
          const key = path.basename(court.images[i]);
          await deleteFileFromS3(key);
        }
      }

      await courtModel.findOneAndDelete({ court_id: req.body.id });

      return res.send({
        status: 0,
        message: "Court Deleted Successfully !",
      });
    } else {
      return res.send({
        status: 1,
        message: "Court Not Found !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

const checkOwner = async (access_token, court_owner) => {
  const owner = await ownerModel.findOne({ access_token: access_token });

  if (!owner) {
    const admin = await adminModel.findOne({ access_token: access_token });

    if (!admin) {
      return {
        status: 1,
        message: "You don't have permission",
      };
    }
  } else {
    if (owner._id.toString() != court_owner.toString()) {
      return {
        status: 1,
        message: "You don't have permission",
      };
    }
  }

  return {
    status: 0,
  };
};

exports.adminCourtList = async (req, res) => {
  try {
    const court = await courtModel.list(req.body);
    let total_count = 0;
    if (req.body.owner_id) {
      total_count = await courtModel
        .find({ owner_id: req.body.owner_id })
        .countDocuments();
    } else {
      total_count = await courtModel.find({}).countDocuments();
    }
    let transformedData = [];
    if (court.length > 0) {
      transformedData = court.map((data) => data.transform(data));
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

exports.employeeCourtList = async (req, res) => {
  try {
    let employeeData = await employeeModel.findOne({
      access_token: req.body.access_token,
    });

    if (!employeeData) {
      return res.send({
        status: 1,
        message: "Employee Not Found",
      });
    }

    let total_count = 0;
    let courts = [];

    if (employeeData.is_access_court) {
      let filter = {
        court_id: { $in: employeeData.courts },
      };
      courts = await courtModel
        .find(filter)
        .populate(courtPopulate)
        .sort({ createdAt: -1 })
        .exec();

      total_count = await courtModel.find(filter).countDocuments();
    }

    let transformedData = [];

    if (courts.length > 0) {
      transformedData = courts.map((data) => data.transform(data));
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

exports.courtByUserTownship = async (req, res) => {
  try {
    let courts = await courtModel
      .find({ township_id: req.body.township_id })
      .limit(6)
      .sort({ createdAt: -1 });

    let needCount = 6 - courts.length;

    if(needCount > 0){
      const rcourts = await courtModel
        .find({ region_id: req.body.region_id })
        .limit(needCount)
        .sort({ createdAt: -1 });

        courts = [...courts, ...rcourts];
    }

   if (courts.length > 0) {
      courts = courts.map((court) => court.transform());
    }

    return res.send({
      status: 0,
      total_count: courts.length,
      data: courts,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.searchCourt = async (req, res) => {
  try {
    const {
      name,
      township_id,
      region_id,
      sport_type_id,
      page = 1,
      per_page = 10,
    } = req.body;
    let filter = {};

    if (name) {
      let regex = new RegExp(name, "i"); // i for case insensitive

      filter = { name: { $regex: regex } };
    }

    if (township_id) {
      filter = { ...filter, township_id };
    }

    if (region_id) {
      filter = { ...filter, region_id };
    }

    if (sport_type_id) {
      filter = { ...filter, sport_type_id };
    }

    const courts = await courtModel
      .find(filter)
      .skip(page - 1)
      .limit(per_page * page)
      .sort({ createdAt: -1 })
      .exec();

    const total_count = await courtModel.find(filter).countDocuments();

    let transformData = [];

    if (courts.length > 0) {
      transformData = courts.map((court) => court.transform());
    }

    if (courts.length === 0) {
      return res.send({
        status: 1,
        message: "Court not found!",
      });
    }
    
    return res.send({
      status: 0,
      total_count,
      data: transformData,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.history = async (req, res) => {
  try {
    const { page, per_page, user_id } = req.body;

    let filter = {};
    let courtHistory = [];
    let transformedData = [];

    let bookings = await bookingModel.find({
      user_id: user_id,
    });

    let courtIds = bookings?.map((booking) => booking.court_id);

    if (bookings) {
      filter = {
        ...filter,
        court_id: { $in: courtIds },
      };
    }

    courtHistory = await courtModel
      .find(filter)
      .populate(courtPopulate)
      .sort({ updatedAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    const total_count = await courtModel.find(filter).countDocuments();

    if (courtHistory.length > 0) {
      transformedData = courtHistory.map((data) => data.transform(data));
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.popularCourtsList = async (req, res) => {
  try {
    let transformData = [];

    const mostBookedCourts = await bookingModel.aggregate([
      {
        $group: {
          _id: "$court_id",
          count: { $sum: 1 },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },

      {
        $limit: 6,
      },
    ]);

    if (mostBookedCourts.length > 0) {
      const mostBookedCourtIds = mostBookedCourts.map((item) => item._id);

      let popularCourts = await courtModel
        .find({
          court_id: { $in: mostBookedCourtIds },
        })
        .populate(courtPopulate)
        .exec();
  
        if(popularCourts.length < 6){
          let randomCourts = await courtModel
          .find({})
          .sort({createdAt: -1})
          .limit(6 - popularCourts.length)
          .populate(courtPopulate)
          .exec();
  
          popularCourts = [...popularCourts,...randomCourts];
        }
  
        if (popularCourts.length > 0) {
            transformData = popularCourts.map((data) => data.transform(data));
        }
  
      return res.send({
        status: 0,
        data: transformData,
      });
    }else {
      return res.send({
        status: 1,
        message: "Most Booked Court Not Found",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};
