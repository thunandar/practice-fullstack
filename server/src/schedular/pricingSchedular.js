const schedule = require("node-schedule");
const planOrderModel = require("../models/planOrder.model");
const ownerModel = require("../models/owner.model");
const pricingModel = require("../models/pricing.model");
const courtModel = require("../models/court.model");
const {
  sendPlanOrderNotiBeforeExpireMail,
} = require("../services/email/mailProvider");

exports.pricingScheduleTask = () => {
  expirePricing();

  process.on("SIGINT", function () {
    schedule.gracefulShutdown().then(() => process.exit(0));
  });
};

function expiredMailUser(owner, plan, messageSuffix, status) {
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
    message: `${messageSuffix}. If you want to renew the plan order, please contact to admin@sports-empire.co`,
    order_id: "SEPO-" + plan.plan_order_id,
    status: status,
  };
}

expirePricing = async () => {
  try {
    schedule.scheduleJob("0 3 * * *", async () => {
      // 0 3 * * * ==== Every 09:30 AM MMT
      console.log("Pricing Schedular Start !");

      const expirePlans = await planOrderModel.expirePlan();

      const expiredWarning = await planOrderModel.expireWarning();

      const expiredWarningOwnerIds = expiredWarning?.map(
        (item) => item.owner_id
      );

      const owners = await ownerModel.find({
        owner_id: { $in: expiredWarningOwnerIds },
      });

      if (expiredWarning.length > 0) {
        owners?.map((owner) => {
          expiredWarning.map((plan) => {
            const user = expiredMailUser(
              owner,
              plan,
              "your order is expiring soon",
              "Expiring Soon"
            );

            sendPlanOrderNotiBeforeExpireMail(user);

            plan.is_warning = true;

            plan.save();
          });
        });
      }

      if (expirePlans.length > 0) {
        for (const [index, plan] of expirePlans.entries()) {
          plan.is_expired = true;
          await plan.save();

          const owner = await ownerModel.findOne({ owner_id: plan.owner_id });

          owner.court_limit -= plan.court_limit;
          owner.marketing_post_limit -= plan.marketing_post_limit;
          owner.push_notification_limit -= plan.push_notification_limit;

          await owner.save();

          const courts = await courtModel
            .find({ owner_id: owner.owner_id })
            .sort({ createdAt: 1 });

          for (const [index, court] of courts.entries()) {
            if (index + 1 <= owner.court_limit) {
              court.active = true;
              await court.save();
            } else {
              court.active = false;
              await court.save();
            }
          }

          const maildata = {
            email: owner.email,
            name: owner.name,
            plan: plan.name,
          };

          const user = expiredMailUser(
            owner,
            plan,
            "your order is expired",
            "Expired"
          );

          sendPlanOrderNotiBeforeExpireMail(user);
        }
      }
    });
  } catch (error) {
    console.log("Pricing Schedular Error == ", error.message);
  }
};
