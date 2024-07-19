const mongoose = require("mongoose") 
const { mongo, env } = require("./vars");
const logger = require("./logger");

mongoose.Promise = Promise;

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

if (env === 'development') {
  mongoose.set('debug', true);
}

exports.connect = async () => {

    // use this url for docker 
    // `mongodb://mongo:27017/sports_empire_db`
    
    mongoose
	  .connect(mongo.uri,  {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
	.then(() => {
		console.log("MongoDb connected !")
	})

    return mongoose.connection;   
}
