const Joi = require("joi")

exports.PricingSchema = Joi.object({
    name: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty' : 'Name is required field',
            }),
    court_limit: Joi
            .number()
            .required()
            .messages({
                'number.base': 'Court must be a number',
                'number.empty' : 'Court is required field',
            }),
    push_notification_limit: Joi
            .number()
            .required()
            .messages({
                'number.base': 'Push Notification Limit must be a number',
                'number.empty' : 'Push Notification Limit is required field',
            }),
    marketing_post_limit: Joi
            .number()
            .required()
            .messages({
                'number.base': 'Marketing Post Limit must be a number',
                'number.empty' : 'Marketing Post Limit is required field',
            }),
                
    
}).options({ allowUnknown: true });