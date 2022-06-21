var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Backend is Running here ok 1992');
});

module.exports = router;
