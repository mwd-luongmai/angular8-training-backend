const express = require('express');
const router = express.Router();
const skillService = require('./skill.service');

// routes
router.post('/add-skill', addSkillProflie);
router.put('/update-skill/:id', update);
router.get('/:id', getById);
router.get('/', getAll);

module.exports = router;

function addSkillProflie(req, res, next) {
  skillService
    .addSkillProfile(req.body)
    .then(() => res.json(['Your skill have been added successfully!']))
    .catch(err => next(err));
}

function getAll(req, res, next) {
  skillService
    .getAllSkills()
    .then(skills => res.json(skills))
    .catch(err => next(err));
}

function getById(req, res, next) {
  skillService
    .getById(req.params.id)
    .then(skill => (skill ? res.json(skill) : res.sendStatus(404)))
    .catch(err => next(err));
}

function update(req, res, next) {
  skillService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}