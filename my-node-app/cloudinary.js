const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: 'dwiaqstbb',
  api_key: '332735778411648',
  api_secret: '0nS4B8qO0lA_-H9SEe2xdA4Exow' // Replace with actual secret
});

module.exports = cloudinary;
