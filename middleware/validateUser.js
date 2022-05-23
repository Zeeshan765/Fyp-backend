const { validate, validateUserReset } = require('../models/User');
function validateUser(req, res, next) {
  let { error } = validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  next();
}

//Validate Login

// function validateLogin(req, res, next) {
//   let { error } = validateUserLogin(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
//   next();
// }

//Validate Reset Password
function validateReset(req, res, next) {
  let { error } = validateUserReset(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
}

module.exports = validateUser;
// module.exports = validateLogin;
module.exports = validateReset;
