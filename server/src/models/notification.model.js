const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { notificationPopulate } = require("../config/populate");

const schema = new mongoose.Schema(
  {
    owner_id: {
      type: Number,
      required: false,
      nullable: true,
    },
    employee_id: {
      type: Number,
      required: false,
      nullable: true,
    },
    user_id: {
      type: Number,
      required: false,
      nullable: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    notification_id: Number,
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

schema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "user_id",
  justOne: true,
});

schema.virtual("employee", {
  ref: "Employee",
  localField: "employee_id",
  foreignField: "employee_id",
  justOne: true,
});

schema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const lastDoc = await mongoose
        .model("Notification", schema)
        .findOne({}, {}, { sort: { notification_id: -1 } })
        .exec();

      doc.notification_id = lastDoc ? lastDoc.notification_id + 1 : 1;
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
    let fields = ["owner", "employee", "user","token", "type", "createdAt"];
    let transformed = {};

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["notification_id"];
    return transformed;
  },
};

schema.statics = {
  list({ page = 1, per_page = 10 }) {
    let filter = {};

    return this.find(filter)
      .populate(notificationPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("Notification", schema);
