const Joi = require("joi");

exports.EmployeeSchema = Joi.object({
    name: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty' : 'Name is required field',
            }),
    phone: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Phone must be an string',
                'string.empty' : 'Phone is required field',
            }),
}).options({ allowUnknown: true });