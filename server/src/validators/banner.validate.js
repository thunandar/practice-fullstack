const Joi = require("joi")

exports.BannerSchema = Joi.object({
    mobile_image: Joi
                .required()
                .messages({
                    'string.empty' : 'Mobile View Image is required field',
                }),
    web_image: Joi
                .required()
                .messages({
                    'string.empty' : 'Web View Image is required field',
                }),
                
    
}).options({ allowUnknown: true });