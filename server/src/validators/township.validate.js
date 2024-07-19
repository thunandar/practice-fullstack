const Joi = require("joi")

exports.TownshipSchema = Joi.object({
    name: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty' : 'Name is required field',
            }),
    region_id: Joi
            .required()
            .messages({
                'number.empty' : 'Region is required field',
            }),
    
}).options({ allowUnknown: true });