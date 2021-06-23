const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate); // login
router.post('/logout', logout); // log out
router.post('/register', register); // sign up
router.post('/forgot-password', forgotPassword); // forgot password
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update); // edit profile
router.put('/:id/password', changePass); // change password
router.delete('/deleteAccount', deleteAccount);
router.put('/:id/deactivate', deactivate);
router.get('/search/:key/:method', search);
router.post('/reset-password', resetPassword);
router.put('/:id/active', active);

module.exports = router;

function authenticate(req, res, next) {
  userService
    .authenticate(req.body)
    .then(user =>
      user
        ? res.json(user)
        : res.status(400).json({
            message: 'Invalid username or password',
          }),
    )
    .catch(err => next(err));
}

function logout(req, res, next) {
  userService
    .logout(req)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then(users => res.json(users))
    .catch(err => next(err));
}

function getCurrent(req, res, next) {
  userService
    .getById(req.user.sub)
    .then(user => (user ? res.json(user) : res.sendStatus(404)))
    .catch(err => next(err));
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then(user => (user ? res.json(user) : res.sendStatus(404)))
    .catch(err => next(err));
}

function update(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function changePass(req, res, next) {
  userService
    .changePass(req.params.id, req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function deleteAccount(req, res, next) {
  userService
    .deleteAccount(req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function deactivate(req, res, next) {
  userService
    .deactivate(req.params.id)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function active(req, res, next){
  userService
    .active(req.params.id)
    .then(() => res.json({}))
    .catch(err => next(err))
}

function forgotPassword(req, res, next) {
  userService
    .forgotPassword(req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function search(req, res, next) {
  userService
    .search(req.params.key, req.params.method)
    .then(users => res.json(users))
    .catch(err => next(err));
}

function resetPassword(req, res, next) {
  userService
    .resetPassword(req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}
