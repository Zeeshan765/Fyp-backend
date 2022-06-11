const { validate } = require("../models/Component");
function validateComponent(req, res, next) {
  let { error } = validate({
    name:req.body.name,
    price:req.body.price,
    description:req.body.description,
    info1:req.body.info1,
    info2:req.body.info2,
    info3:req.body.info3,
    info4:req.body.info4,
  });
  if (error) return res.status(400).send(error.details[0].message);
  next();
}
module.exports = validateComponent;