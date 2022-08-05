const mongoose = require("mongoose");

let classificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  deletedAt: { type: String, default: "" },
});

let Classification = mongoose.model("classification", classificationSchema);

module.exports = Classification;
