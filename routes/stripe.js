const router = require('express').Router();
const authorization = require('../middleware/authorization');
// const stripe = require("stripe")(process.env.STRIPE_KEY);
const KEY = process.env.STRIPE_KEY;
const stripe = require('stripe')(KEY);

router.post('/payment', async (req, res) => {
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: 'pkr',
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
        //res.status(500).json("Not Authorized");
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

module.exports = router;
