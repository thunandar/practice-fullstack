const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { contactPopulate } = require("../config/populate");

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
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    contact_id: Number,
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
        .model("Contact", schema)
        .findOne({}, {}, { sort: { contact_id: -1 } })
        .exec();

      doc.contact_id = lastDoc ? lastDoc.contact_id + 1 : 1;
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
    let fields = ["owner", "employee", "user","message", "type", "createdAt"];
    let transformed = {};

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["contact_id"];
    return transformed;
  },
};

schema.statics = {
  list({ page = 1, per_page = 10 }) {
    let filter = {};

    return this.find(filter)
      .populate(contactPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("Contact", schema);
