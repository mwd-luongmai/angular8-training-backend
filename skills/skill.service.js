const config = require('../config.json');
const jwt = require('jsonwebtoken');
const blacklist = require('express-jwt-blacklist');
const hashUtils = require('../_helpers/hash-utils');
const uuid = require('uuid');
const db = require('../_helpers/db');
const url = require('url');
const Skill = db.Skill;

module.exports = {
  addSkillProfile,
  getAllSkills,
  getById,
  update
};

async function addSkillProfile(skillObject) {
  const skill = await Skill.findOne({
    skillName: skillObject.skillName
  });
  if (skill) {
    throw 'The skill name has already been taken.';
  }

  const newSkill = new Skill(skillObject);
  return newSkill.save();
}

async function getAllSkills() {
  return await Skill.find({});
}

async function getById(id) {
  try {
    return await Skill.findById(id);
  } catch(err) {
    throw "Your skill is not found";
  }
}

async function update(id, skillProfile) {
  try {
    const query = { _id: id };
    const rest  = await Skill.update(query, skillProfile);
    if (rest.n > 0) {
      return "Your skill have been update successfully!";
    }
    return "Can not found your skill object";
  } catch(err) {
    throw err;
  }
}
