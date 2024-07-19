//const subscriptionModel = require("../models/subscription.model");
const subscribePricingModel = require("../models/subscribePricing.model");
const { validationResponse } = require("../utils/validationResponse");
const {
  SubscribePricingSchema,
} = require("../validators/subscribePricing.validate");

exports.create = async (req, res) => {
  console.log("hello world!!!!");
  try {
    const { error, value } = SubscribePricingSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const subscribePricing = new subscribePricingModel(value);

      await subscribePricing.save();

      return res.send({
        status: 0,
        message: "Subscribe Pricing Created Successfully !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
