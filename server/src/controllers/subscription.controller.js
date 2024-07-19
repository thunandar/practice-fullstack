const dayjs = require("dayjs");
const ownerModel = require("../models/owner.model");
const subscribePricingModel = require("../models/subscribePricing.model");
const { validationResponse } = require("../utils/validationResponse");
const { SubscriptionSchema } = require("../validators/subscription.validate");
const { billingCycle, subscriptionStatus } = require("../config/vars");
const subscriptionModel = require("../models/subscription.model");
const { primaryDateFormat } = require("../utils/date-time");
const {sendSubscriptionAccountMail,sendPlanOrderVerifyMail,sendPlanOrderNotiBeforeExpireMail,} = require("../services/email/mailProvider");
const courtModel = require("../models/court.model");
const { subscriptionPopulate } = require("../config/populate");
const moment = require("moment");

function mailUser(owner, subscription, messageSuffix, status) {
  return {
    name: owner.name,
    email: owner.email,
    plan: {
      price: subscription.price,
      start_date: subscription.start_date,
      expired_date: subscription.expired_date,
    },
    invoice_date: primaryDateFormat(Date.now()),
    message: `We ${messageSuffix} your order. ${
      status === "Declined"
        ? "Please, for more information contact to admin@sports-empire.co."
        : "Please check your order details. If it's not correct, please reply to admin@sports-empire.co."
    }`,
    order_id: "SEPO-" + subscription.subscription_id,
    status: status,
  };
}

exports.subscribeAccount = async (req, res) => {
  try {
    const { error, value } = SubscriptionSchema.validate(req.body, {
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

      value.owner_id = owner.owner_id;

      const pricing = await subscribePricingModel.findOne({
        subscribe_pricing_id: value.subscribe_pricing_id,
      });

      if (pricing) {
        value.pricing_id = pricing.pricing_id;
      }

      let duration = 1;
      let type = "monthly";

      if (value.billing_type == billingCycle.quarterly) {
        duration = 3;
        type = "quarterly";
      } else if (value.billing_type == billingCycle.halfYearly) {
        duration = 6;
        type = "halfYearly";
      } else if (value.billing_type == billingCycle.yearly) {
        duration = 12;
        type = "yearly";
      } else {
        duration = 1;
        type = "monthly";
      }

      const total_cost = duration * pricing.price[type];

      value.price = total_cost;

      let today = dayjs(new Date());
      value.start_date = today;
      value.expired_date = today.add(duration, "month");

      const subscription = new subscriptionModel(value);

      await subscription.save();

      const user = {
        name: owner.name,
        email: owner.email,
        subscription: {
          price: total_cost,
        },
        invoice_date: primaryDateFormat(Date.now()),
        message:
          "We will approve your subscription within 24 hrs ! please send payment screenshot and invoice to admin@sports-empire.co.",
        subscription_id: "SEPO-" + subscription.subscription_id,
        status: "Pending",
      };


     await sendSubscriptionAccountMail(user);

      return res.send({
        status: 0,
        data: user,
        message: "We will approved your subscription within 24 hrs!",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.subscribeHistory = async (req, res) => {
  try {
    const { status = "all", access_token = "" } = req.body;

    let filter = {};
    

    filter = { owner_id: req.body.owner_id };

    if (status != "all") {
      filter = { ...filter, status: req.body.status };
    }

    const total_count = await subscriptionModel.find(filter).countDocuments();

    const subscriptions = await subscriptionModel.list(req.body);

    let transformData = [];

    if (subscriptions.length > 0) {
      transformData = subscriptions.map((sub) => sub.transform(sub));
    }

    return res.send({
      status: 0,
      data: transformData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.updateAccountSubscription = async (req, res) => {
  try {
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

    const subscription = await subscriptionModel.findOne({
      subscription_id: req.body.subscription_id,
    });

    if (!subscription) {
      return res.send({
        status: 1,
        message: " Not Found",
      });
    }

    if (subscription.is_expired) {
      return res.send({
        status: 1,
        message: "Account was expired , subscribe new account !",
      });
    }

    req.body.status = 0;
    req.body.is_retry = true;
    req.body.is_warning = false;
    req.body.is_expired = false;
    await subscriptionModel.findOneAndUpdate(
      { subscription_id: req.body.subscription_id },
      req.body,
      { returnOriginal: false }
    );

     const user = mailUser(owner, subscription, "pending", "Pending");

    //  await sendPlanOrderMail(user);

    return res.send({
      status: 0,
      data: user,
      message: "We will approved your update subscription within 24 hrs!",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.subscribeDetail = async (req, res) => {
  try {
    const subscription = await subscriptionModel
      .findOne({ subscription_id: req.body.id })
      .populate(subscriptionPopulate);

    return res.send({
      status: 0,
      data: subscription == null ? {} : subscription.transform(),
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

// Admin
exports.adminUpdateAccountStatus = async (req, res) => {
  try {
    const { error, value } = SubscriptionSchema.validate(req.body, {
      abortEarly: false,
    });

    const { id, status, message = "" } = req.body;

    const subscription = await subscriptionModel.findOne({
      subscription_id: id,
    });

    const owner = await ownerModel.findOne({ owner_id: subscription.owner_id });

    if (!subscription) {
      return res.send({
        status: 1,
        message: "Subscription Not Found !",
      });
    }

    if (subscriptionStatus.approved == status) {
      if (subscription.is_retry) {
        const startDate = dayjs(subscription.start_date);
        const endDate = dayjs(subscription.expired_date);
        let duration = endDate.diff(startDate, "month");

        subscription.retry_count += 1;
        subscription.is_retry = false;
        subscription.is_expired = false;
        subscription.is_warning = false;
        subscription.expired_date = dayjs(subscription.expired_date).add(
          duration,
          "month"
        );
      }

      subscription.status = subscriptionStatus.approved;

      await subscription.save();

      if (!subscription.is_retry) {
        const owner = await ownerModel.findOne({
          owner_id: subscription.owner_id,
        });

        if (!owner) {
          return res.send({
            status: 1,
            message: "Owner Not Found !",
          });
        }

        await owner.save();

        const courts = await courtModel.find({ owner_id: owner.owner_id });

        if (courts.length > 0) {
          for (const [index, court] of courts.entries()) {
            if (index + 1 <= owner.court_limit) {
              court.active = true;
              await court.save();
            } else {
              court.active = false;
              await court.save();
            }
          }
        }
      }

      //const user = mailUser(owner, plan, "approved", "Approved");

      //await sendPlanOrderVerifyMail(user);
    } else if (subscriptionStatus.reject == status) {
      subscription.status = subscriptionStatus.reject;

      await subscription.save();

      const user = mailUser(
        owner,
        subscription,
        "are sorry to inform you that your subscription was declined",
        "Declined"
      );

      // await sendPlanOrderVerifyMail(user);
    } else {
      subscription.status = subscriptionStatus.pending;

      await subscription.save();
    }

    return res.send({
      status: 0,
      message: "Owner Account Status Updated",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { status = "all", owner_id = "" } = req.body;

    let filter = {};
    let owner;
    req.body.owner = "";
    if (owner_id != "") {
      owner = await ownerModel.findOne({ owner_id });

      if (!owner) {
        return res.send({
          status: 1,
          message: "Owner Not Found",
        });
      }
      filter = { ...filter, owner: owner._id };
      req.body.owner = owner._id;
    }

    if (status != "all") {
      filter = { status: req.body.status };
    }

    const total_count = await subscriptionModel.find(filter).countDocuments();

    const subscriptions = await subscriptionModel.list(req.body);

    let transformData = [];

    if (subscriptions.length > 0) {
      transformData = subscriptions.map((sub) => sub.transform(sub));
    }

    return res.send({
      status: 0,
      data: transformData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};
