const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dob: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  bmi: { type: Number },
  macrosToTrack: [{ type: String, enum: ["Calories", "Protein", "Fats", "Carbs"] }], // max 4
  macroTargets: { type: Map, of: Number } // key-value pairs for targets
});

module.exports = mongoose.model("UserProfile", UserProfileSchema);
