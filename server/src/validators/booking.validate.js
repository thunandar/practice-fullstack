const Joi = require("joi")

exports.BookingSchema = Joi.object({
    court_id: Joi
                .required()
                .messages({
                    'string.empty' : 'Court is required field',
                }),
    booking_time: Joi
                    .required()
                    .messages({
                        'string.base': 'Time must be an array',
                        'string.empty' : 'Time is required field',
                    }),
    booking_date: Joi
            .required()
            .messages({
                'string.empty' : 'Date is required field',
            }),

    is_manual: Joi
            .boolean()
            .messages({
                'boolean.base': 'Is Manual must be a boolean',
                'boolean.empty' : 'Is Manual is required field',
            }),
    
}).options({ allowUnknown: true });