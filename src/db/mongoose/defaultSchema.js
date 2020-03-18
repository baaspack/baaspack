const mongoose = require('mongoose');

/* eslint-disable no-multi-spaces */
const defaultSchema = new mongoose.Schema({
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
}, {
  timestamps: true,     // automatically create createdAt & updatedAt fields
  strict: false,        // don't enforce a schema
});

export default defaultSchema;
