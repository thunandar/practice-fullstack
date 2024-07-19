const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    price: {
      monthly: Number,
      quarterly: Number,
      halfYearly: Number,
      yearly: Number,
    },
    subscribe_pricing_id: Number,
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const lastDoc = await mongoose
        .model("SubscribePricing", schema)
        .findOne({}, {}, { sort: { subscribe_pricing_id: -1 } })
        .exec();

      doc.subscribe_pricing_id = lastDoc ? lastDoc.subscribe_pricing_id + 1 : 1;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

schema.method({
  transform() {
    let fields = ["price", "createdAt"];
    let transformed = {};

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["subscribe_pricing_id"];
    transformed["data_id"] = "SEP-" + this["subscribe_pricing_id"];

    return transformed;
  },
});

schema.statics = {
  list({ page = 1, per_page = 10 }) {
    let select = "pricing_id price createdAt";

    if (per_page == "all") {
      return this.find({}).select(select).sort({ createdAt: -1 }).exec();
    }

    return this.find({})
      .select(select)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("SubscribePricing", schema);
