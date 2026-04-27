const express = require("express");
const router = express.Router();
const Food = require("../models/Food");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");


// ================== CLOUDINARY STORAGE ==================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "food_items",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});


// ================== ADD FOOD ==================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    const newFood = new Food({
      name,
      price,
      category,
      description,
      image: req.file ? req.file.path : null, // ✅ Cloudinary URL
      cloudinary_id: req.file ? req.file.filename : null, // store public_id
    });

    await newFood.save();

    res.status(201).json({
      message: "Food added successfully",
      food: newFood,
    });

  } catch (error) {
    console.error("ADD FOOD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================== GET ALL FOOD ==================
router.get("/", async (req, res) => {
  try {
    const { category, available, featured, q } = req.query;

    const filter = {};

    if (category) {
      filter.category = String(category).toLowerCase();
    }

    if (available === "true") {
      filter.isAvailable = true;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    // build final mongo query
    const mongoQuery = { ...filter };

    if (q) {
      mongoQuery.$or = [
        { name: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }

    const foods = await Food.find(mongoQuery).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================== GET AVAILABLE FOOD ==================
router.get("/available", async (req, res) => {
  try {
    const foods = await Food.find({ isAvailable: true });
    res.json(foods);
  } catch (error) {
    console.error("AVAILABLE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================== GET FOOD BY ID ==================
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================== UPDATE FOOD ==================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    let updateData = {
      name,
      price,
      category,
      description,
    };

    const existingFood = await Food.findById(req.params.id);

    if (!existingFood) {
      return res.status(404).json({ message: "Food not found" });
    }

    // ✅ If new image uploaded → delete old image
    if (req.file) {
      if (existingFood.cloudinary_id) {
        await cloudinary.uploader.destroy(existingFood.cloudinary_id);
      }

      updateData.image = req.file.path;
      updateData.cloudinary_id = req.file.filename;
    }

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Food updated successfully",
      food: updatedFood,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================== TOGGLE AVAILABILITY ==================
router.patch("/:id/toggle", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.json({
      message: "Availability updated",
      isAvailable: food.isAvailable,
    });

  } catch (error) {
    console.error("TOGGLE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================== DELETE FOOD ==================
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // ✅ Delete image from Cloudinary
    if (food.cloudinary_id) {
      await cloudinary.uploader.destroy(food.cloudinary_id);
    }

    await Food.findByIdAndDelete(req.params.id);

    res.json({ message: "Food deleted successfully" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;