const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  skillName: { type: String, unique: true, required: true },
  skillSchemaName: { type: String, required: true },
  skillStatus: { type: Boolean, required: true },
  skillLevels: [
    { 
      skillLevelName: String,
      skillLevelDescription: String 
    }
  ]
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Skill', schema);
