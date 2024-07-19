const Joi = require("joi");

// const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.userRegisterSchema = Joi.object({
  name: Joi.string()
    .required()
    // .min(3)
    // .max(20)
    .messages({
      "string.base": "Name must be a string",
      // 'string.min' : 'Name should be minimum 3 character ',
      // 'string.max' : 'Name should be maximum 20 character',
      "string.empty": "Name is required field",
    }),
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  phone: Joi.string().min(5).max(13).messages({
    "string.base": "Phone Number must be a string",
    "string.min": "Phone Number should be minimum 5 character ",
    "string.max": "Phone Number should be maximum 13 character",
    "string.empty": "Phone Number is required field",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    // .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      // 'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.ref("password")
}).options({ allowUnknown: true });

exports.userLoginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    // .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      // 'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
      "any.required": "Password is required",
    }),
    device_id: Joi.string().required().messages({
    "string.empty": "Device Id is required",
    "any.required": "Device Id is required",
  }),
}).options({ allowUnknown: true });

exports.userPasswordUpdateSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    //   .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      //   'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.ref("password"),
}).options({ allowUnknown: true });

exports.ownerRegisterSchema = Joi.object({
  name: Joi.string()
    .required()
    // .min(3)
    // .max(20)
    .messages({
      "string.base": "Name must be a string",
      // 'string.min' : 'Name should be minimum 3 character ',
      // 'string.max' : 'Name should be maximum 20 character',
      "string.empty": "Name is required field",
    }),
  business_name: Joi.string()
    .required()
    // .min(3)
    // .max(20)
    .messages({
      "string.base": "Busniess Name must be a string",
      // 'string.min' : 'Busniess Name should be minimum 3 character ',
      // 'string.max' : 'Busniess Name should be maximum 20 character',
      "string.empty": "Busniess Name is required field",
    }),
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  phone: Joi.string().min(5).max(13).messages({
    "string.base": "Phone Number must be a string",
    "string.min": "Phone Number should be minimum 5 character ",
    "string.max": "Phone Number should be maximum 13 character",
    "string.empty": "Phone Number is required field",
  }),
  // address: Joi
  //         .string()
  //         .required()
  //         .messages({
  //             'string.base': 'Address must be a string',
  //             'string.empty' : 'Address is required field',
  //         }),
  nrc_front: Joi.required().messages({
    "string.empty": "NRC front image is required field",
  }),
  nrc_back: Joi.required().messages({
    "string.empty": "NRC back image is required field",
  }),
  nrc_no: Joi.string().required().messages({
    "string.base": "NRC must be a string",
    "string.empty": "NRC is required field",
  }),
  tag_ids: Joi.required().messages({
    "string.base": "Tags must be an array",
    "string.empty": "Tags is required field",
  }),
}).options({ allowUnknown: true });

exports.ownerLoginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  nrc_no: Joi.string()
    .required()
    //   .min(15)
    //   .max(23)
    .messages({
      "string.base": "NRC must be a string",
      //   'string.min' : 'NRC should be minimum 15 character ',
      //   'string.max' : 'NRC should be maximum 23 character',
      "string.empty": "NRC is required field",
    }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    // .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      // 'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
      "any.required": "Password is required",
    }),
}).options({ allowUnknown: true });

exports.employeeLoginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(20)
    // .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      // 'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
      "any.required": "Password is required",
    }),
}).options({ allowUnknown: true });
