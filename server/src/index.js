const logger = require('./config/logger');
const mongoose = require('./config/mongoose');
const http = require('http');
const app = require('./config/express');
const { env, port } = require('./config/vars');
//const { pricingScheduleTask } = require('./schedular/pricingSchedular');

try {
    if (env === "production") {
        const httpServer = http.createServer(app);
        httpServer.listen(port, () => logger.info(`server started on port ${port} (${env})`));
    } else{
        const httpServer = http.createServer(app);
        httpServer.listen(port, () => logger.info(`server started on port ${port} (${env})`));
    }
} catch (error) {
    logger.warn("Error == ", error.message)
}

//pricingScheduleTask();

mongoose.connect();

module.exports = app;
