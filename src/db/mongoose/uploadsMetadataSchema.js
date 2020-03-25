const mongoose = require('mongoose');

/* eslint-disable no-multi-spaces */

const uploadsMetadataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  bucket: { type: String, required: true },
}, {
  timestamps: true,
  strict: true,
});

export default uploadsMetadataSchema;
