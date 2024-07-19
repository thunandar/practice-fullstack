const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { reviewPopulate } = require("../config/populate");

const schema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: false,
      min: 3,
      max: 3000
    },
    court_id: {
      type: Number,
      required: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
    is_report: {
      type: Boolean,
      default: false,
    },
    review_id: Number,
    access_token: String,
  },
  {
    timestamps: true,
  }
);

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

schema.virtual("court", {
  ref: "Court",
  localField: "court_id",
  foreignField: "court_id",
  justOne: true,
});

schema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "user_id",
  justOne: true,
});

schema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const lastDoc = await mongoose
        .model("Reviews", schema)
        .findOne({}, {}, { sort: { review_id: -1 } })
        .exec();

      doc.review_id = lastDoc ? lastDoc.review_id + 1 : 1;
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
      "rate",
      "message",
      "court",
      "user",
      "is_report",
      "createdAt",
    ];

    let transformed = {};

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["review_id"];
    return transformed;
  },
});

schema.statics = {
  list({ page = 1, per_page = 10, court_id = "" }) {
    let filter = {};

    if (court_id != "") {
      filter = { court_id };
    }

    return this.find(filter)
      .populate(reviewPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("Reviews", schema);
