const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  bio: { type: String },
  company: { type: String },
  location: { type: String },
  active: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
  resetPasswordToken: { type: String },
  skills: [{
    skillProfileId: String,
    skillLevelId: String
  }]
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);
