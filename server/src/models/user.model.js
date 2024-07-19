const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { userPopulate } = require("../config/populate");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
      minLength: 5,
      maxLength: 16,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    tags: [Number],
    region_id: {
      type: Number,
      required: false,
    },
    township_id: {
      type: Number,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
      trim: true,
    },
    lang: {
      type: String,
      default: "en",
    },
    is_update_default_data: {
      type: Boolean,
      default: false,
    },
    verify_code: {
      type: String,
      required: false,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    services: {
      facebook: String,
      google: String,
    },
    user_id: Number,
    access_token: String,
  },
  {
    timestamps: true,
  }
);

schema.virtual("region", {
  ref: "Region",
  localField: "region_id",
  foreignField: "region_id",
  justOne: true,
});

schema.virtual("township", {
  ref: "Township",
  localField: "township_id",
  foreignField: "township_id",
  justOne: true,
});

schema.virtual("sport_type_data", {
  ref: "SportType",
  localField: "tags",
  foreignField: "sport_type_id",
  justOne: false,
});

schema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const lastDoc = await mongoose
        .model("User", schema)
        .findOne({}, {}, { sort: { user_id: -1 } })
        .exec();

      doc.user_id = lastDoc ? lastDoc.user_id + 1 : 1;
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
      "name",
      "email",
      "phone",
      "avatar",
      "region",
      "township",
      "lang",
      "device_id",
      // 'login_type',
      "is_update_default_data",
      "createdAt",
    ];
    let transformed = {};
    transformed["tags"] = this["sport_type_data"];
    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    transformed["id"] = this["user_id"];
    transformed["data_id"] = "SEU-" + this["user_id"];

    return transformed;
  },
});

schema.statics = {
  list({ page = 1, per_page = 10 }) {
    return this.find({})
      .populate(userPopulate)
      .sort({ createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },

  async oAuthLogin({ service, id, email, name, picture }) {
    const user = await this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }],
    });

    if (user) {
      user.services[service] = id;
      if (!user.name) user.name = name;
      if (!user.avatar) user.avatar = picture;
      return user.save();
    }
    const password = await bcrypt.hash(uuidv4(), 10);
    return this.create({
      services: { [service]: id },
      email,
      password,
      name,
      avatar: picture,
    });
  },
};

schema.plugin(uniqueValidator);

module.exports = mongoose.model("User", schema);
