const Joi = require("joi");

exports.CourtSchema = Joi.object({
    name: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty' : 'Name is required field',
            }),
    sport_type_id: Joi
                .number()
                .required()
                .messages({
                    'string.base': 'Sport Type id must be number',
                    'string.empty' : 'Sport Type is required field',
                }),
    images: Joi
            .required()
            .messages({
                'string.base': 'Images must be an array',
                'string.empty' : 'Images is required field',
            }),
    price: Joi
            .required()
            .messages({
                'string.base': 'Price must be an array',
                'string.empty' : 'Price is required field',
            }),
    phone: Joi
            .string()
            .required()
            .messages({
                'string.base': 'Phone must be an string',
                'string.empty' : 'Phone is required field',
            }),
    
    region_id: Joi
            .number()
            .required()
            .messages({
                'string.base': 'Region Type id must be number',
                'string.empty' : 'Region Type is required field',
            }),

    township_id: Joi
                .number()
                .required()
                .messages({
                    'string.base': 'Region Type id must be number',
                    'string.empty' : 'Region Type is required field',
                }),

    street_1: Joi
                .string()
                .required()
                .messages({
                    'string.base': 'Street 1 must be a string',
                    'string.empty' : 'Street 1 is required field',
                }),
}).options({ allowUnknown: true });