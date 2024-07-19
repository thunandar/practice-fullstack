const dayjs = require("dayjs");
const ownerModel = require("../models/owner.model");
const pricingModel = require("../models/pricing.model");
const { validationResponse } = require("../utils/validationResponse");
const { PlanOrderSchema } = require("../validators/planOrder.validate");
const { billingCycle, planStatus } = require("../config/vars");
const planOrderModel = require("../models/planOrder.model");
const { primaryDateFormat } = require("../utils/date-time");
const {
  sendPlanOrderMail,
  sendPlanOrderVerifyMail,
  sendPlanOrderNotiBeforeExpireMail,
} = require("../services/email/mailProvider");
const courtModel = require("../models/court.model");
const { planPopulate } = require("../config/populate");
const moment = require("moment");

exports.planOrder = async (req, res) => {
  try {
    const { error, value } = PlanOrderSchema.validate(req.body, {
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

      const pricing = await pricingModel.findOne({
        pricing_id: value.pricing_id,
      });

      if (pricing) {
        value.name = pricing.name;
        value.court_limit = pricing.court_limit;
        value.push_notification_limit = pricing.push_notification_limit;
        value.marketing_post_limit = pricing.marketing_post_limit;
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

      const plan = new planOrderModel(value);

      await plan.save();

      const user = {
        name: owner.name,
        email: owner.email,
        plan: {
          name: pricing.name,
          price: total_cost,
          month: pricing.month,
          court_limit: pricing.court_limit,
          marketing_post_limit: pricing.marketing_post_limit,
          push_notification_limit: pricing.push_notification_limit,
        },
        invoice_date: primaryDateFormat(Date.now()),
        message:
          "We will approved your order within 24 hrs ! please send payment screenshot and invoice to admin@sports-empire.co.",
        order_id: "SEPO-" + plan.plan_order_id,
        status: "Pending",
      };

      await sendPlanOrderMail(user);

      return res.send({
        status: 0,
        data: user,
        message: "We will approved your order within 24 hrs!",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.planHistory = async (req, res) => {
  try {
    const { status = "all", access_token = "" } = req.body;

    let filter = {};
    

    filter = { owner_id: req.body.owner_id };

    if (status != "all") {
      filter = { ...filter, status: req.body.status };
    }

    const total_count = await planOrderModel.find(filter).countDocuments();

    const plans = await planOrderModel.list(req.body);

    let transformData = [];

    if (plans.length > 0) {
      transformData = plans.map((plan) => plan.transform(plan));
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

exports.updatePlanOrder = async (req, res) => {
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

    const planOrder = await planOrderModel.findOne({
      plan_order_id: req.body.plan_order_id,
    });

    if (!planOrder) {
      return res.send({
        status: 1,
        message: " Not Found",
      });
    }

    if (planOrder.is_expired) {
      return res.send({
        status: 1,
        message: "Plan Order was expired , buy new plan !",
      });
    }

    req.body.status = 0;
    req.body.is_retry = true;
    req.body.is_warning = false;
    req.body.is_expired = false;
    await planOrderModel.findOneAndUpdate(
      { plan_order_id: req.body.plan_order_id },
      req.body,
      { returnOriginal: false }
    );

    const user = mailUser(owner, planOrder, "pending", "Pending");

    await sendPlanOrderMail(user);

    return res.send({
      status: 0,
      data: user,
      message: "We will approved your update order within 24 hrs!",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.planDetail = async (req, res) => {
  try {
    const plan = await planOrderModel
      .findOne({ plan_order_id: req.body.id })
      .populate(planPopulate);

    return res.send({
      status: 0,
      data: plan == null ? {} : plan.transform(),
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

function mailUser(owner, plan, messageSuffix, status) {
  return {
    name: owner.name,
    email: owner.email,
    plan: {
      name: plan.name,
      price: plan.price,
      start_date: plan.start_date,
      expired_date: plan.expired_date,
      court_limit: plan.court_limit,
      marketing_post_limit: plan.marketing_post_limit,
      push_notification_limit: plan.push_notification_limit,
    },
    invoice_date: primaryDateFormat(Date.now()),
    message: `We ${messageSuffix} your order. ${
      status === "Declined"
        ? "Please, for more information contact to admin@sports-empire.co."
        : "Please check your order details. If it's not correct, please reply to admin@sports-empire.co."
    }`,
    order_id: "SEPO-" + plan.plan_order_id,
    status: status,
  };
}

// Admin
exports.adminUpdatePlanStatus = async (req, res) => {
  try {
    const { error, value } = PlanOrderSchema.validate(req.body, {
      abortEarly: false,
    });

    const { id, status, message = "" } = req.body;

    const plan = await planOrderModel.findOne({ plan_order_id: id });

    const owner = await ownerModel.findOne({ owner_id: plan.owner_id });

    if (!plan) {
      return res.send({
        status: 1,
        message: "Plan Not Found !",
      });
    }

    if (planStatus.approved == status) {
      if (plan.is_retry) {
        const startDate = dayjs(plan.start_date);
        const endDate = dayjs(plan.expired_date);
        let duration = endDate.diff(startDate, "month");
        console.log("duration", duration);

        plan.retry_count += 1;
        plan.is_retry = false;
        plan.is_expired = false;
        plan.is_warning = false;
        plan.expired_date = dayjs(plan.expired_date).add(duration, "month");
      }

      plan.status = planStatus.approved;

      await plan.save();

      if (!plan.is_retry) {
        const owner = await ownerModel.findOne({ owner_id: plan.owner_id });

        if (!owner) {
          return res.send({
            status: 1,
            message: "Owner Not Found !",
          });
        }

        owner.court_limit += plan.court_limit;
        owner.push_notification_limit += plan.push_notification_limit;
        owner.marketing_post_limit += plan.marketing_post_limit;

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

      const user = mailUser(owner, plan, "approved", "Approved");

      await sendPlanOrderVerifyMail(user);
    } else if (planStatus.reject == status) {
      plan.status = planStatus.reject;

      await plan.save();

      const user = mailUser(
        owner,
        plan,
        "are sorry to inform you that your order was declined",
        "Declined"
      );

      await sendPlanOrderVerifyMail(user);
    } else {
      plan.status = planStatus.pending;

      await plan.save();
    }

    return res.send({
      status: 0,
      message: "Owner Plan Status Updated",
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

    const total_count = await planOrderModel.find(filter).countDocuments();

    const plans = await planOrderModel.list(req.body);

    let transformData = [];

    if (plans.length > 0) {
      transformData = plans.map((plan) => plan.transform(plan));
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

