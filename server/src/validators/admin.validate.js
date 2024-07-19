const Joi = require("joi");

// const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.adminLoginSchema = Joi.object({
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

exports.adminRegisterSchema = Joi.object({
  name: Joi.string()
    .required()
    // .min(3)
    // .max(20)
    .messages({
      "string.base": "Name must be a string",
      "string.min": "Name should be minimum 3 character ",
      "string.max": "Name should be maximum 20 character",
      "string.empty": "Name is required field",
    }),
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    // .min(5)
    // .max(13)
    .messages({
      "string.base": "Phone Number must be a string",
      "string.min": "Phone Number should be minimum 5 character ",
      "string.max": "Phone Number should be maximum 13 character",
      "string.empty": "Phone Number is required field",
    }),
  password: Joi.string()
    .required()
    // .min(6)
    // .max(20)
    // .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      // 'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.ref("password"),
}).options({ allowUnknown: true });

exports.adminUpdateSchema = Joi.object({
  name: Joi.string()
    // .min(3)
    // .max(20)
    .messages({
      "string.base": "Name must be a string",
      "string.min": "Name should be minimum 3 character ",
      "string.max": "Name should be maximum 20 character",
    }),
  email: Joi.string().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  phone: Joi.string()
    // .min(5)
    // .max(13)
    .messages({
      "string.base": "Phone Number must be a string",
      "string.min": "Phone Number should be minimum 5 character ",
      "string.max": "Phone Number should be maximum 13 character",
    }),
  password: Joi.string()
    // .min(6)
    // .max(20)
    // .pattern(new RegExp(passwordRegex))
    .messages({
      "string.base": "Password must be a string",
      // 'string.pattern.base': 'Password must contain at least one lowercase letter, one digit, and one special character',
    }),

  confirmPassword: Joi.ref("password"),
}).options({ allowUnknown: true });
