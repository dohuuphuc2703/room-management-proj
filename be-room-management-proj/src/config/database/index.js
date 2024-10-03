const mongoose = require("mongoose");
const keys = require("../secrets");

async function connect() {
  await mongoose.connect(keys.mongoAtlasURI)
    .then(() => console.log(`Connected to MongoAtlas`))
    .catch((err) => console.error(`MongoDB connection error: ${err}`));
}

module.exports = {
  connect,
}