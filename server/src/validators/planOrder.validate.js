const Joi = require("joi");

exports.PlanOrderSchema = Joi.object({
    pricing_id: Joi
            .number()
            .required()
            .messages({
                'number.base': 'Pricing Id must be a number',
                'number.empty' : 'Pricing Id is required field',
            }),
    billing_type: Joi
                    .number()
                    .required()
                    .messages({
                        'number.base': 'Billing Type must be a number',
                        'number.empty' : 'Billing Type is required field',
                    }),
}).options({ allowUnknown: true });