const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { billingCycle, subscriptionStatus } = require("../config/vars");
const { subscriptionPopulate } = require("../config/populate");

const schema = new mongoose.Schema(
  {
    owner_id: {
      type: Number,
      required: true,
    },
    subscribe_pricing_id: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    billing_type: {
      type: Number,
      default: billingCycle.monthly,
    },
    start_date: {
      type: Date,
      required: true,
    },
    expired_date: {
      type: Date,
      required: true,
    },
    status: {
      type: Number,
      default: subscriptionStatus.pending,
    },
    is_expired: {
      type: Boolean,
      default: false,
    },
    is_retry: {
      type: Boolean,
      default: false,
    },
    is_warning: {
      type: Boolean,
      default: false,
    },
    retry_count: {
      type: Number,
      default: 1,
    },
    subscription_id: Number,
  },
  {
    timestamps: true,
  }
);

schema.virtual("owner", {
  ref: "Owner",
  localField: "owner_id",
  foreignField: "owner_id",
  justOne: true,
});

schema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const lastDoc = await mongoose
        .model("Subscription", schema)
        .findOne({}, {}, { sort: { subscription_id: -1 } })
        .exec();

      doc.subscription_id = lastDoc ? lastDoc.subscription_id + 1 : 1;
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
    let fields = [
      "owner",
      "subscribe_pricing_id",
      "price",
      "billing_type",
      "start_date",
      "expired_date",
      "status",
      "is_active",
      "is_expired",
      "createdAt",
    ];
    let transformed = {};

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["subscription_id"];
    return transformed;
  },
});

schema.statics = {
  list({ page = 1, per_page = 10, status = "all", owner_id = "" }) {
    let filter = {};

    if (status != "all") {
      filter = { status: status };
    }

    if (owner_id != "") {
      filter = { ...filter, owner_id: owner_id };
    }

    return this.find(filter)
      .populate(subscriptionPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },

  ongoingPlan(owner) {
    const filter = {
      $where: function () {
        return (
          this.start_date <= Date.now() &&
          this.expired_date >= Date.now() &&
          this.is_expired == false
        );
      },
    };

    return this.find({ ...filter, owner })
      .populate(subscriptionPopulate)
      .sort({ createdAt: -1 })
      .exec();
  },

  expirePlan() {
    const filter = {
      $where: function () {
        return this.expired_date <= Date.now() && this.is_expired == false;
      },
    };

    return this.find(filter)
      .populate(subscriptionPopulate)
      .sort({ createdAt: -1 })
      .exec();
  },
  expireWarning() {
    const filter = {
      $where: function () {
        const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000;
        return (
          Date.now() >= this.expired_date - threeDaysInMilliseconds &&
          this.is_expired == false &&
          this.is_warning == false
        );
      },
    };

    return this.find(filter)
      .populate(planPopulate)
      .sort({ createdAt: -1 })
      .exec();
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("Subscription", schema);
