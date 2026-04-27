const Food = require("../models/Food");
const cloudinary = require("../config/cloudinary");

exports.addFood = async (req, res) => {
  const result = await cloudinary.uploader.upload_stream(
    { folder: "food" },
    async (error, result) => {
      const food = await Food.create({
        ...req.body,
        image: result.secure_url
      });
      res.json(food);
    }
  );

  result.end(req.file.buffer);
};

exports.toggleAvailability = async (req, res) => {
  const food = await Food.findById(req.params.id);
  food.isAvailable = !food.isAvailable;
  await food.save();
  res.json(food);
};