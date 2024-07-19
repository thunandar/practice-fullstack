const Joi = require("joi")

exports.UserDefaultDetailsSchema = Joi.object({
    region_id: Joi
            .required()
            .messages({
                'string.empty' : 'Region is required field',
            }),
    township_id: Joi
            .required()
            .messages({
                'string.empty' : 'Township is required field',
            }),

    lang: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Language must be a string',
                'string.empty' : 'Language Name is required field',
            }),

    tag_ids: Joi
            .required()
            .messages({
                'string.base': 'Tags must be an array',
                'string.empty' : 'Tags is required field',
            }),
    
}).options({ allowUnknown: true });