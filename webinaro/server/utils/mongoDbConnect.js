var mongoose = require("mongoose");
const promiseRetry = require("promise-retry");

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function () {
    lastTry = 0;
  console.log("Mongoose default connection open to " + dbUri);
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
  console.log("Mongoose default connection error: " + err);
  if (!lastTry) {
    lastTry = 1;
    connect(dbUri);
  }
});

let lastTry = 0;
// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose default connection disconnected");
  if (!lastTry) {
    lastTry = 1;
    connect(dbUri);
  }
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

const options = {
  //  useNewUrlParser: true,
  //useCreateIndex: true,
  //useFindAndModify: false,
  //autoIndex: false, // Don't build indexes
  //reconnectTries: 60,
  //reconnectInterval: 5000,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 12000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};
//172.16.122.203
// mongoose.connect(process.env.MONGO_DB_URL||'mongodb://localhost/image-config', options).then((db) => {
//   console.log("conneted to db from app.ts");
// }).catch(err=>{
//   console.log("error =========>>>",err.message,err.stack);
// });

const promiseRetryOptions = {
  retries: 60,
  factor: 1.5,
  minTimeout: 5000,
  maxTimeout: 5000,
};
var dbUri = null;

const connect = (dbUrl) => {
  return promiseRetry((retry, number) => {
    dbUri = dbUrl;
    console.log(`MongoClient connecting to ${dbUrl} - retry number: ${number}`);
    return mongoose.connect(dbUrl, options).catch(retry);
  }, promiseRetryOptions);
};

module.exports = { connect };
