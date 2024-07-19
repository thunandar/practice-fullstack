const Joi = require("joi")

exports.RegionSchema = Joi.object({
    name: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty' : 'Name is required field',
            }),
    
}).options({ allowUnknown: true });