const Joi = require("joi")

exports.ContactSchema = Joi.object({
    message: Joi
                .string()
                .required()
                .messages({
                    'string.empty' : 'Message is required field',
                })    
}).options({ allowUnknown: true });