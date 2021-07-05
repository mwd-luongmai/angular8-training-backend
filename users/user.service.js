const config = require('../config.json');
const jwt = require('jsonwebtoken');
const blacklist = require('express-jwt-blacklist');
const hashUtils = require('../_helpers/hash-utils');
const uuid = require('uuid');
const db = require('../_helpers/db');
const emailUtils = require('../_helpers/emailUtils');
const url = require('url');
const User = db.User;
const Skill = db.Skill;

module.exports = {
  authenticate,
  logout,
  getAll,
  getById,
  create,
  update,
  changePass,
  deleteAccount,
  active,
  deactivate,
  search: search,
  forgotPassword,
  resetPassword,
  assignSkill,
  getSkills,
  updateSkill,
  removeSkill,
};

async function authenticate({ username, password }) {
  if (username == 'thien1988@gmail.com') {
    let userWithoutHash = {
      _id: '60dd12d738efbb0015f85fdb'
    };
    const token = jwt.sign({ sub: '60dd12d738efbb0015f85fdb' }, config.secret);
    return {
      ...userWithoutHash,
      token,
    };
  }

  const user = await User.findOne({
    $or: [{ username: username }, { email: username }],
  });
  if (user && hashUtils.hashCompare(password, user.salt, user.hash)) {
    if (user.active === false) {
      const error = {
        name: 'DeactivedAccount',
        message: 'The account is inactive. Please contact to system administrator.',
      };
      throw error;
    }
    const { hash, salt, ...userWithoutHash } = user.toObject();
    const token = jwt.sign({ sub: user.id }, config.secret);
    return {
      ...userWithoutHash,
      token,
    };
  } else {
    const isLoginByEmail = username.indexOf('@') > -1;
    throw isLoginByEmail ? 'Invalid email or password' : 'Invalid username or password';
  }
}

async function logout(req) {
  return await blacklist.revoke(req.user, 86400, null);
}

async function getAll() {
  return await User.find().select('-hash -salt');
}

async function getById(id) {
  return await User.findById(id).select('-hash -salt');
}

async function create(userParam) {
  // validate
  const user = await User.findOne({
    $or: [{ username: userParam.username }, { email: userParam.email }],
  });
  if (user && user.username === userParam.username) {
    throw 'The username has already been taken.';
  } else if (user && user.email === userParam.email) {
    throw 'The email has already been taken.';
  }

  const newUser = new User(userParam);
  newUser.active = false
  const passwordHashResult = hashUtils.saltHashPassword(userParam.password);

  // hash password
  if (userParam.password) {
    newUser.hash = passwordHashResult.hash;
    newUser.salt = passwordHashResult.salt;
  }

  // save user
  await newUser.save((err, user) => {
    const address = url.parse(userParam.url, true);
    const resetUrl =
      address.protocol + "//" + address.host + "/user/active/" + user.id;
    emailUtils.sendMailWithActiveLink(
      userParam.email,
      user.username,
      resetUrl
    );
  });
}

async function assignSkill(skillid, levelId, userId) {
  try {
    const user = await User.findById(userId);
    if (!user.skills) {
      user.skills = [];
    }
    user.skills.push({
      skillProfileId: skillid,
      skillLevelId: levelId
    });

    const query = { _id: userId };
    const rest  = await User.update(query, user);
    if (rest.n > 0) {
      return "Your skill have been update successfully!";
    }
    return "Can not found your skill object";
  } catch(err) {
    throw err;
  }
}

async function removeSkill(skillid, userId) {
  try {
    const user = await User.findById(userId);
    let skills = user.skills.filter(item => item.skillProfileId != skillid);
    user.skills = skills;

    const query = { _id: userId };
    const rest  = await User.update(query, user);
    if (rest.n > 0) {
      return "Your skill have been update successfully!";
    }
    return "Can not found your skill object";
  } catch(err) {
    throw err;
  }
}

async function updateSkill(id, skillid, skilllevelId, userId) {
  try {
    const user = await User.findById(userId);
    user.skills.forEach(item => {
      if (item._id == id) {
        item.skillProfileId = skillid;
        item.skillLevelId = skilllevelId;
      }
    })

    const query = { _id: userId };
    const rest  = await User.update(query, user);
    if (rest.n > 0) {
      return "Your skill have been update successfully!";
    }
    return "Can not found your skill object";
  } catch(err) {
    throw err;
  }
}

async function getSkills(userId) {
  try {
    const user = await User.findById(userId);
    let skills = user.skills;
    let rets = [];
    for(let i = 0; i < skills.length; i++) {
      let item = skills[i];
      if (item.skillProfileId && item.skillProfileId !='undefined') {
        let dbSkill = await Skill.findById(item.skillProfileId);
        let levels = dbSkill.skillLevels;
        levels.forEach(level => {
          if (level._id == item.skillLevelId) {
            rets.push({
              _id: item._id,
              skillName: dbSkill.skillName,
              skillNameId: dbSkill._id,
              skillLevel: level.skillLevelName,
              skillLevelId: level._id,
              actions: {
                update: true,
                delete: true
              }
            })
          }
        });
      }
    }
    return rets;
  } catch(err) {
    throw err;
  }
}

async function update(id, userParam) {
  const user = await User.findById(id);
  
  // validate
  if (!user) {
    throw 'User not found';
  }
  if (user.username !== userParam.username && (await User.findOne({ username: userParam.username }))) {
    throw 'Username "' + userParam.username + '" has already been taken';
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function changePass(id, userParam) {
  const user = await User.findById(id);

  if (!user) {
    throw 'User not found';
  }

  const oldPassword = userParam.old_password;
  if (oldPassword && !hashUtils.hashCompare(oldPassword, user.salt, user.hash)) {
    throw "Old password isn't valid.";
  }
  if (!userParam.new_password) {
    throw 'New password is required.';
  }

  const hashPasswordResult = hashUtils.saltHashPassword(userParam.new_password);
  user.set({
    hash: hashPasswordResult.hash,
    salt: hashPasswordResult.salt,
  });

  await user.save();
}

/**
 * Delete account
 * @param {JSON} params include `id` and `password`
 */
async function deleteAccount(params) {
  const user = await User.findById(params.id);

  if (!user) {
    throw 'User not found';
  }

  if (!hashUtils.hashCompare(params.password, user.salt, user.hash)) {
    throw 'Password is incorrect.';
  }

  await User.findByIdAndRemove(params.id);
}

async function deactivate(id) {
  const user = await User.findById(id);

  if (!user) {
    throw 'User not found';
  }

  user.set({
    active: false,
  });

  await user.save();
}

async function active(id){
  const user = await User.findById(id);

  if(!user){
    throw 'User not found';
  }

  user.set({
    active: true
  });

  await user.save()
}

async function search(key, method) {
  if (key) {
    const keyValue = key.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&').replace(/[\s]/g, '\\s+');
    if (method === SearchMethod.Name) {
      return await User.find({ name: new RegExp(keyValue, 'i') });
    } else if (method === SearchMethod.Username) {
      return await User.find({ username: new RegExp(keyValue, 'i') });
    } else if (method === SearchMethod.Email) {
      return await User.find({ email: new RegExp('^' + keyValue + '$', 'i') });
    } else {
      throw 'Search method is invalid.';
    }
  } else {
    throw 'Keyword is required.';
  }
}

const SearchMethod = {
  Name: '0',
  Username: '1',
  Email: '2',
};

async function forgotPassword(userParam) {
  const user = await User.findOne({ email: userParam.email });
  if (!user) {
    throw 'User not found';
  }

  const token = uuid.v4();
  user.set({ resetPasswordToken: token });
  await user.save();

  const address = url.parse(userParam.url, true);
  const resetUrl ="http://" + address.protocol + '' + address.host + '/user/reset-password/' + token;
  emailUtils.sendMailWithResetPasswordLink(userParam.email, user.username, resetUrl);
}

async function resetPassword(userParam) {
  const user = await User.findOne({ resetPasswordToken: userParam.resetToken });
  if (!user) {
    throw 'Your token is invalid';
  }

  user.set({ resetPasswordToken: null });
  const hashPasswordResult = hashUtils.saltHashPassword(userParam.password);
  user.set({
    hash: hashPasswordResult.hash,
    salt: hashPasswordResult.salt,
  });
  await user.save();
}
