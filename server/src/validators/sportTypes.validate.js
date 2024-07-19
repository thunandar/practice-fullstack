const Joi = require("joi")

exports.sportTypesSchema = Joi.object({
    name: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty' : 'Name is required field',
            }),

    icon: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Icon must be a string',
                'string.empty' : 'Name is required field',
            }),
    
}).options({ allowUnknown: true });