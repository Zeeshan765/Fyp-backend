const jwt = require('jsonwebtoken');
let { User } = require('../models/User');

async function authorization(req, res, next) {
  let token = req.header('x-auth-token');
  if (!token)
    return res
      .status(400)
      .json('Token Not Provided . Your are Not Authenticated');
  try {
    //if token Exsist Then Let Verify this
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = await User.findById(decoded._id); //---->Contain all the id, name , role of the user/Admin
    //req.user = decoded;
  } catch (error) {
    return res.status(401).json('mal-formed Token');
  }

  next();
}
module.exports = authorization;
