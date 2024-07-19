const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { loginAttemptPopulate } = require("../config/populate");

const schema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
    },
    device_id: {
      type: String,
      required: true,
    },
    login_attempt_count: {
      type: Number,
      default: 1,
    },
    login_time: {
      type: Date,
      default: Date.now,
    },

    login_attempt_id: Number,
  },
  {
    timestamps: true,
  }
);
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
        .model("LoginAttempt", schema)
        .findOne({}, {}, { sort: { login_attempt_id: -1 } })
        .exec();

      doc.login_attempt_id = lastDoc ? lastDoc.login_attempt_id + 1 : 1;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

schema.methods = {
  transform(data = this) {
    let fields = ["user", "login_attempt_count", "login_time", "createdAt"];
    let transformed = {};

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["login_attempt_id"];
    return transformed;
  },
};

schema.statics = {
  list({ page = 1, per_page = 10 }) {
    let filter = {};

    return this.find(filter)
      .populate(loginAttemptPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("LoginAttempt", schema);
