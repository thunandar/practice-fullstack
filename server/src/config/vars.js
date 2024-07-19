const path = require('path');

require('dotenv-safe').config({
    path: path.join(__dirname, '../../.env'),
    example: path.join(__dirname, '../../.env.example'),
});

module.exports = {
    baseurl : process.env.NODE_ENV == 'development' ? process.env.DEVELOPMENT_URL : process.env.PRODUCTION_URL,
    env : process.env.NODE_ENV,
    port : process.env.PORT,
    mongo : {
        uri : process.env.NODE_ENV == 'development' ? process.env.MONGOOSE_DEVELOPMENT_URL : process.env.MONGOOSE_PRODUCTION_URL,
    },
    jwtToken : process.env.JWT_TOKEN,
    role: {
        admin: 0,
        moderator: 1,
    },
    mail: {
        host: process.env.EMAIL_HOST,
        post: process.env.EMAIL_PORT,
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        vector_url: process.env.EMAIL_VECTOR_URL
    },
    file: {
        upload_image_size: process.env.IMAGE_UPLOAD_SIZE,
        default_image: process.env.DEFAULT_IMAGE_URL
    },
    ownerStatus: {
        pending: 0,
        approved: 1,
        blocked: 2,
        failed: 3
    },
    aws: {
        bucket_name: process.env.AWS_BUCKET_NAME,
        region: process.env.AWS_BUCKET_REGION,
        access_key: process.env.AWS_ACCESS_KEY,
        secret_key: process.env.AWS_SECRET_KEY,
    },
    bookingStatus: {
        booked: 0,
        played: 1,
        canceled: 2,
        refund: 4
    },
    billingCycle: {
        monthly: 1,
        quarterly: 3,
        halfYearly: 6,
        yearly: 12
    },
    planStatus: {
        pending: 0,
        approved: 1,
        reject: 2,
    },
    subscriptionStatus: {
        pending: 0,
        approved: 1,
        reject: 2,
    },
    google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET
    }
}