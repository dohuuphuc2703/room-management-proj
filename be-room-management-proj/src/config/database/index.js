const mongoose = require("mongoose");
const keys = require("../secrets");
const { calculateRoomRatings } = require("../../app/services/ratingServices");

async function connect() {
  await mongoose.connect(keys.mongoAtlasURI)
    .then(() => {
      console.log(`Connected to MongoAtlas`)
      calculateRoomRatings();
    
    })
    .catch((err) => console.error(`MongoDB connection error: ${err}`));
}

module.exports = {
  connect,
}