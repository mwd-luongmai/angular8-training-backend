const config = require('../config.json');
const mongoose = require('mongoose');
mongoose.connect(
  process.env.MONGODB_URI || config.connectionString,
  { useNewUrlParser: true },
);
mongoose.Promise = global.Promise;

module.exports = {
  User: require('../users/user.model'),
  Skill: require('../skills/skill.model'),
};
