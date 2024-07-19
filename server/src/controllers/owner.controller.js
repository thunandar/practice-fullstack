const { ownerStatus, jwtToken } = require("../config/vars");
const ownerModel = require("../models/owner.model");
const {
  sendOwnerMail,
  sendOwnerApprovedMail,
} = require("../services/email/mailProvider");
const { getRandomNumbers } = require("../utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { ownerRegisterSchema } = require("../validators/auth.validator");
const { uploadFile } = require("../utils/file");
// const { deleteFile } = require("../config/s3");
 const { deleteFile } = require("../config/s3");

const { validationResponse } = require("../utils/validationResponse");
const courtModel = require("../models/court.model");
const bookingModel = require("../models/booking.model");
const { ownerPopulate } = require("../config/populate");
const { changeDateTimeFormat } = require("../utils/date-time");

const calculateBalances = (owners) => {
  let appBalance = 0;
  let transactionBalance = 0;
  let appCount = 0;

  owners?.forEach((data) => {
    appBalance += data.total_amount;

    if (!data.is_manual) {
      transactionBalance += data.total_amount;
      appCount++;
    }
  });

  const manualBalance = appBalance - transactionBalance;
  const chargesForTransaction = 0.05 * transactionBalance; // 5% of transaction

  return {
    appBalance,
    transactionBalance,
    manualBalance,
    chargesForTransaction,
    appCount,
  };
};

exports.dashboard = async (req, res) => {
  try {
    const { id, access_token, from, to } = req.body;

    const owner = await ownerModel.findOne({ owner_id: id });

    if (!owner) {
      return res.send({
        status: 1,
        message: "Owner Not Found !",
      });
    }

    const dateFilter = ownerDateFilter(id, from, to); 

    const owners = await bookingModel.find(dateFilter).exec();

    const {
      appBalance,
      transactionBalance,
      manualBalance,
      chargesForTransaction,
      appCount,
    } = calculateBalances(owners);

    const total_count = await bookingModel.find(dateFilter).countDocuments();
    const manualCount = total_count - appCount;

    return res.send({
      status: 0,
      app_balance: appBalance,
      transaction_balance: transactionBalance,
      manual_balance: manualBalance,
      charges_for_transaction: chargesForTransaction,
      total_count: total_count,
      app_count: appCount,
      manual_count: manualCount,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

function ownerDateFilter(id, from, to) {
  let filter = {};

   if (id) {
      filter = {
        ...filter,
        owner_id: id,
      };
    }

  const { startDate, endDate } = changeDateTimeFormat(from, to);

  if (startDate !== null && endDate !== null) {
    filter = {
      ...filter,
      booking_date: { $gte: startDate, $lte: endDate },
    };
  }
  return filter;
}

exports.adminUpdateOwnerStatus = async (req, res) => {
  try {
    const owner = await ownerModel.findOne({ owner_id: req.body.id });

    if (!owner) {
      return res.send({
        status: 1,
        message: "Owner Not Found !",
      });
    }

    (owner.password = ""), (owner.access_token = "");

    let subject = "";
    let message = "";

    if (req.body.status == ownerStatus.pending) {
      owner.status = ownerStatus.pending;
      subject = "Pending Owner Account";
      message =
        "Dear Customer , Sports Empire team changed your owner account to pending state. please connect with customer service .";
    } else if (req.body.status == ownerStatus.blocked) {
      owner.status = ownerStatus.blocked;
      subject = "S.Empire Blocked Owner Account";
      message =
        "Dear Customer , Sports Empire team changed your owner account to blocked state due to some policy. please connect with customer service .";
    } else if (req.body.status == ownerStatus.failed) {
      owner.status = ownerStatus.failed;
      subject = "Failed Owner Account Registeration in Sport Empire";
      message =
        "Dear Customer , Your owner account creation failed in Sports Empire due to some issues. please connect with customer service .";
    } else if (req.body.status == ownerStatus.approved) {
      if (!owner.is_email_verified) {
        return res.send({
          status: 1,
          message: "Owner email not verified !",
        });
      }

      owner.status = ownerStatus.approved;
      const payload = {
        owner: {
          email: owner.email,
        },
      };
      const password = getRandomNumbers();

      subject = "Approved Owner Account Registeration in Sport Empire";
      message =
        "Dear Customer , Your owner account creation was approved in Sports Empire . Please Login with this password. ";

      const encryptedPassword = await bcrypt.hash(password, 10);

      let access_token = jwt.sign(
        payload,
        jwtToken,
        { expiresIn: "24h" },
        async (err, access_token) => {
          if (err) return err;

          return access_token;
        }
      );

      owner.access_token = access_token;
      owner.password = encryptedPassword;

      await owner.save();

      let data = {
        name: owner.name,
        email: owner.email,
        subject: subject,
        message: message,
        password,
      };

      await sendOwnerApprovedMail(data);
    } else {
      return res.send({
        status: 1,
        message: "Please provide right status !",
      });
    }

    await owner.save();

    if (req.body.status != ownerStatus.approved) {
      let data = {
        name: owner.name,
        email: owner.email,
        subject: subject,
        message: message,
      };

      await sendOwnerMail(data);
    }

    return res.send({
      status: 0,
      message: "Owner Status Updated Successfully !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { page, per_page, status, search } = req.body;
    const owner = await ownerModel.list(req.body);

    let filter = {};
    let transformedData = [];

    if (search) {
      filter = {
        $or: [
          { name: new RegExp(search, "i") },
          { owner_id: parseInt(search) || 0 },
          { email: new RegExp(search, "i") },
        ],
      };
    }

    if (status && status !== "all") {
      filter = {
        ...filter,
        status: status,
      };
    }

    const owners = await ownerModel
      .find(filter)
      .populate(ownerPopulate)
      .sort({ updatedAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();

    if (owners.length > 0) {
      transformedData = owners.map((data) => data.transform(data));
    }

    const total_count = await ownerModel.find(filter).countDocuments();

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

exports.detail = async (req, res) => {
  try {
    const owner = await ownerModel
      .findOne({ owner_id: req.body.id })
      .populate(ownerPopulate);

    if (owner) {
      return res.send({
        status: 0,
        data: owner.transform(owner),
      });
    } else {
      return res.send({
        status: 1,
        message: "Owner Not Found",
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
      const owner = await ownerModel.findOne({ owner_id: value.id });

      if (owner) {
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

            if (owner.avatar) {
              const key = path.basename(admin.avatar);
              await deleteFile(key);
            }
          } else {
            avatar = req.body.avatar;
          }
        }

        if (req.body.business_logo) {
          if (!req.body.business_logo.startsWith("http")) {
            let result = await uploadFile(req.body.business_logo);

            if (result.status == 1) {
              return res.send(result);
            }

            value.business_logo =
              req.protocol +
              "://" +
              req.get("host") +
              "/images/" +
              result.data.Key;

            if (owner.business_logo) {
              const key = path.basename(owner.business_logo);
              await deleteFile(key);
            }
          } else {
            value.business_logo = req.body.business_logo;
          }
        }

        if (req.body.nrc_front) {
          if (!req.body.nrc_front.startsWith("http")) {
            let result = await uploadFile(req.body.nrc_front);

            if (result.status == 1) {
              return res.send(result);
            }

            value.nrc_front =
              req.protocol +
              "://" +
              req.get("host") +
              "/images/" +
              result.data.Key;

            if (owner.nrc_front) {
              const key = path.basename(owner.nrc_front);
              await deleteFile(key);
            }
          } else {
            value.nrc_front = req.body.nrc_front;
          }
        }

        if (req.body.nrc_back) {
          if (!req.body.nrc_back.startsWith("http")) {
            let result = await uploadFile(req.body.nrc_back);

            if (result.status == 1) {
              return res.send(result);
            }

            value.nrc_back =
              req.protocol +
              "://" +
              req.get("host") +
              "/images/" +
              result.data.Key;

            if (owner.nrc_back) {
              const key = path.basename(owner.nrc_back);
              await deleteFile(key);
            }
          } else {
            value.nrc_back = req.body.nrc_back;
          }
        }

        value.tags = value.tag_ids;

        value.status = owner.status;
        value.email = owner.email;

        await ownerModel.findOneAndUpdate({ owner_id: value.id }, value, {
          returnOriginal: false,
        });

        return res.send({
          status: 0,
          message: "Owner Updated Successfully !",
        });
      } else {
        return res.send({
          status: 1,
          message: "Owner Not Found",
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
    const owner = await ownerModel.findOne({ owner_id: req.body.id });

    if (owner) {
      if (owner.avatar) {
        const key = path.basename(owner.avatar);
        await deleteFile(key);
      }

      if (owner.business_logo) {
        const key = path.basename(owner.business_logo);
        await deleteFile(key);
      }

      if (owner.nrc_front) {
        const key = path.basename(owner.nrc_front);
        await deleteFile(key);
      }

      if (owner.nrc_back) {
        const key = path.basename(owner.nrc_back);
        await deleteFile(key);
      }

      const courts = await courtModel.find({ owner_id: owner.owner_id });

      if (courts.length > 0) {
        courts.map(async (court) => {
          await courtModel.findOneAndDelete({ court_id: court.court_id });
        });
      }

      await ownerModel.findOneAndDelete({ owner_id: req.body.id });

      return res.send({
        status: 0,
        message: "Owner Deleted Successfully !",
      });
    } else {
      return res.send({
        status: 1,
        message: "Owner Not Found",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.updateOwnerProfile = async (req, res) => {
  try {
    const owner = await ownerModel.findOne({
      access_token: req.body.access_token,
    });

    if (owner) {
      if (req.body.avatar) {
        if (!req.body.avatar.startsWith("http")) {
          let result = await uploadFile(req.body.avatar);

          if (result.status == 1) {
            return res.send(result);
          }
          req.body.avatar =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/" +
            result.data.Key;

          if (owner.avatar) {
            const key = path.basename(owner.avatar);
            await deleteFile(key);
          }
        } else {
          owner.avatar = req.body.avatar;
        }
      }

      if (req.body.business_logo) {
        if (!req.body.business_logo.startsWith("http")) {
          let result = await uploadFile(req.body.business_logo);

          if (result.status == 1) {
            return res.send(result);
          }

          req.body.business_logo =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/" +
            result.data.Key;

          if (owner.business_logo) {
            const key = path.basename(owner.business_logo);
            await deleteFile(key);
          }
        } else {
          owner.business_logo = req.body.business_logo;
        }
      }

      req.body.tags = req.body.tag_ids;

      // don't update fields
      req.body.email = owner.email;
      req.body.status = owner.status;
      req.body.nrc_no = owner.nrc_no;
      req.body.nrc_front = owner.nrc_front;
      req.body.nrc_back = owner.nrc_back;
      req.body.court_limit = owner.court_limit;
      req.body.push_notification_limit = owner.push_notification_limit;
      req.body.marketing_post_limit = owner.marketing_post_limit;
      req.body.court_limit = owner.court_limit;
      req.body.verify_code = owner.verify_code;
      req.body.password = owner.password;
      req.body.access_token = owner.access_token;

      await ownerModel.findOneAndUpdate(
        { access_token: req.body.access_token },
        req.body,
        { returnOriginal: false }
      );

      return res.send({
        status: 0,
        message: "Owner Updated Successfully !",
      });
    } else {
      return res.send({
        status: 1,
        message: "Invalid Token",
        is_login: true,
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.updateOwnerPassword = async (req, res) => {
  try {
    let acc = await ownerModel.findOne({ access_token: req.body.access_token });

    if (!acc) {
      return res.send({
        status: 1,
        message: "Invalid Token",
        is_login: true,
      });
    }

    const encryptedPassword = await bcrypt.hash(req.body.new_password, 10);

    const isMatch = await bcrypt.compare(req.body.old_password, acc.password);

    if (isMatch) {
      const payload = {
        owner: {
          email: acc.email,
        },
      };

      jwt.sign(
        payload,
        jwtToken,
        { expiresIn: "24h" },
        async (err, access_token) => {
          if (err) return err;

          acc.access_token = access_token;
          acc.password = encryptedPassword;
          await acc.save();

          let owner = acc.transform();

          res.status(200).json({
            status: 0,
            message: "Owner Password Updated Successfully !",
            owner,
            access_token,
          });
        }
      );
    } else {
      return res.send({
        status: 1,
        message: "Old Password Not correct !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
