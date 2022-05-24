const Cart = require('../models/Cart');
const User = require('../models/User');
const express = require('express');
const mongoose = require('mongoose');
//import product
const Product = require('../models/Product');
const Component = require('../models/Component');
const authorization = require('../middleware/authorization');
let router = express.Router();

//CREATE
router.post('/', authorization, async (req, res) => {
  console.log(req.body);

  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    //if cart already exist then update it by adding other product
    //if (req.body.type === 'PRODUCT') {
    //&& item.type === req.body.type
    //Checking if Item already in Cart
    for (item of cart.items) {
      if (item.product === req.body.product) {
        item.quantity = item.quantity + req.body.quantity;
        await Cart.findOneAndUpdate(
          { _id: cart._id, 'items._id': item._id },
          { 'items.$.quantity': item.quantity }
        );

        return res.status(200).json('Quantity Updated');
      }
    }
    //Add new product in the cart

    cart.items.push({
      product: req.body.product,
      type: req.body.type,
      quantity: req.body.quantity,
    });
    console.log('cart :', cart);
    await cart.save();
    return res.send(cart);
    //res.status(200).json({ message: cart });
    // Cart.findByIdAndUpdate(cart._id, { items: cart.items });
    // return res.status(200).json(cart);
  } else {
    //if cart not exist than create the new one
    cart = new Cart({
      user: req.user._id,
      items: [
        {
          product: req.body.product,
          type: req.body.type,
          quantity: req.body.quantity,
        },
      ],
      // cart.items.push({
      //   productId: req.body.product,
      //   quantity: req.body.quantity,
      // }),
    });
    console.log(cart.user);
    console.log('cart :', cart);
    await cart.save();
    return res.send(cart);
    // }
  }
});
//Post Custom Cart
router.post('/cartarray', authorization, async (req, res) => {
  console.log(req.body.array.length);
  // await Cart.findOneAndDelete({ user: req.user._id });

  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    //Checking if Item already in Cart
    // for (item of cart.items) {
    //   if (item.product === req.body.product) {
    //     item.quantity = item.quantity + req.body.quantity;
    //     await Cart.findOneAndUpdate(
    //       { _id: cart._id, "items._id": item._id },
    //       { "items.$.quantity": item.quantity }
    //     );

    //     return res.status(200).json("Quantity Updated");
    //   }
    //  }

    //Add new product in the cart

    req.body.array.forEach((element) => {
      if (element) {
        if (element.category === 'Ram') {
          console.log(element.orgPrice);
          cart.items.push({
            product: element._id,
            type: 'Custom',
            quantity: element.price / element.orgPrice,
          });
        } else {
          cart.items.push({
            product: element._id,
            type: 'Custom',
            quantity: 1,
          });
        }
      }
    });
    console.log('cart :', cart);
    await cart.save();
    return res.send(cart);
    //res.status(200).json({ message: cart });
    // Cart.findByIdAndUpdate(cart._id, { items: cart.items });
    // return res.status(200).json(cart);
  } else {
    //if cart not exist than create the new one
    cart = new Cart({
      user: req.user._id,
    });
    req.body.array.forEach((element) => {
      if (element) {
        if (element.category === 'Ram') {
          console.log(element.orgPrice);
          cart.items.push({
            product: element._id,
            type: 'Custom',
            quantity: element.price / element.orgPrice,
          });
        } else {
          cart.items.push({
            product: element._id,
            type: 'Custom',
            quantity: 1,
          });
        }
      }
    });

    console.log(cart.user);
    console.log('cart :', cart);
    await cart.save();
    return res.send(cart);
    // }
  }
});
//  cart = new Cart({
//   user: req.user._id,
//   items: [{ product: req.body.product, quantity: req.body.quantity }],
//   // cart.items.push({
//   //   productId: req.body.product,
//   //   quantity: req.body.quantity,
//   // }),
// });

// console.log(cart.user);
//cart.productId = req.body.productId;
//cart.quantity = req.body.quantity;
// let id = req.body.productId;
// let value = req.body.quantity;
// console.log('id', id);
// console.log('quantity', value);
// //cart.items.push({ id, value });
// cart.items.push({
//   productId: req.body.productId,
//   quantity: req.body.quantity,
// });
// console.log('cart :', cart);
// await cart.save();
// return res.send(cart);
// });

//get cart length
router.get('/length', authorization, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    return res.status(200).json(cart.items.length);
  } else {
    return res.status(200).json(0);
  }
});

//DELETE cart/Clear Cart
router.delete('/clear', authorization, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json('Cart has been deleted...');
  } catch (err) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
});

//Get Custom User Cart

router.get('/cartarray', authorization, async (req, res) => {
  //console.log(req.body);
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      //console.log(cart.items[0].quantity);
      if (cart.items.length === 0) {
        return res.status(200).json('Cart is Empty');
      }
    } else {
      return res.status(200).json('Cart is Empty');
    }
    let modedCart = [];
    const length = cart.items.length;
    let count = 0;
    //let ramvalue=4;
    cart.items.forEach(async (item) => {
      if (item.type === 'Custom') {
        await Component.findById(item.product)
          .then((component) => {
            console.log(component);
            modedCart.push({
              name: component.name,
              price: component.price * item.quantity,
              picture: component.picture,
              quantity: item.quantity,
              type: item.type,
              _id: component._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
      count++;
      if (count === length) {
        //sum of all the prices with quantity
        let totalPrice = 0;
        modedCart.forEach((item) => {
          totalPrice += item.price * item.quantity;
        });
        return res
          .status(200)
          .json({ totalPrice: totalPrice, cart: modedCart });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json('Internal Server Error');
  }
});

//Get Simple Cart
router.get('/', authorization, async (req, res) => {
  //console.log(req.body);
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    console.log(cart);
    if (cart) {
      //   //console.log(cart.items[0].quantity);
      if (cart.items.length === 0) {
        return res.status(200).json('Cart is Empty');
      }
    }
    //  else {
    //   return res.status(200).json("Cart is Empty");
    // }
    let modedCart = [];
    const length = cart.items.length;
    let count = 0;
    cart.items.forEach(async (item) => {
      if (item.type === 'Product') {
        await Product.findById(item.product)
          .then((product) => {
            console.log(item._id);
            modedCart.push({
              _id: item._id,

              name: product.name,
              price: product.price,
              picture: product.picture,
              quantity: item.quantity,
              type: item.type,
              _id: product._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (item.type === 'Component') {
        await Component.findById(item.product)
          .then((component) => {
            console.log(component);
            modedCart.push({
              _id: item._id,
              name: component.name,
              price: component.price,
              picture: component.picture,
              quantity: item.quantity,
              type: item.type,
              _id: component._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
      count++;
      if (count === length) {
        //sum of all the prices with quantity
        let totalPrice = 0;
        modedCart.forEach((item) => {
          totalPrice += item.price * item.quantity;
        });
        return res
          .status(200)
          .json({ totalPrice: totalPrice, cart: modedCart });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json('Internal Server Error');
  }
});
//Get Complete Cart
router.get('/complete', authorization, async (req, res) => {
  //console.log(req.body);
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      //console.log(cart.items[0].quantity);
      if (cart.items.length === 0) {
        return res.status(200).json('Cart is Empty');
      }
    }
    // else {
    //   return res.status(200).json("Cart is Empty");
    // }
    let modedCart = [];
    const length = cart.items.length;
    let count = 0;
    cart.items.forEach(async (item) => {
      if (item.type === 'Product') {
        await Product.findById(item.product)
          .then((product) => {
            console.log(product);
            modedCart.push({
              name: product.name,
              price: product.price,
              picture: product.picture,
              quantity: item.quantity,
              type: item.type,
              _id: product._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (item.type === 'Component') {
        await Component.findById(item.product)
          .then((component) => {
            console.log(component);
            modedCart.push({
              name: component.name,
              price: component.price,
              picture: component.picture,
              quantity: item.quantity,
              type: item.type,
              _id: component._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (item.type === 'Custom') {
        await Component.findById(item.product)
          .then((component) => {
            console.log(component);
            modedCart.push({
              name: component.name,
              price: component.price,
              picture: component.picture,
              quantity: item.quantity,
              type: item.type,
              _id: component._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
      count++;
      if (count === length) {
        //sum of all the prices with quantity
        let totalPrice = 0;
        modedCart.forEach((item) => {
          totalPrice += item.price * item.quantity;
        });
        return res
          .status(200)
          .json({ totalPrice: totalPrice, cart: modedCart });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json('Internal Server Error');
  }
});

//Delete Particular Item from the cart

router.patch('/deleteItem/:id', authorization, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      console.log('1');
      //This remove cart from database
      // if (cart.items.length <= 1) {
      //   await Cart.findOneAndDelete({ _id: cart._id });
      //   return res.send("Item Deleted");
      // }
      for (i = 0; i < cart.items.length; i++) {
        console.log(cart.items[i].product.toString());
        if (cart.items[i].product.toString() === req.params.id) {
          console.log(cart.items[i]._id);
          cart.items.splice(i, 1);
          await Cart.findOneAndUpdate({ _id: cart._id }, { items: cart.items });
          return res.send('Item Deleted Successfully');
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

// // //UPDATE Increment
// // router.get("/gettotal", authorization, async (req, res) => {
// //   try {
// //     const orders = await Cart.find({ user: req.user._id }).populate("totalPrice")
// //     .lean();
// //     return res.status(200).json(orders);
// //   } catch (err) {
// //     return res.status(500).json(err);
// //   }

// })

//UPDATE Increment
router.patch('/increment/:id', authorization, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .lean();
    if (cart) {
      for (item of cart.items) {
        if (item._id.toString() === req.params.id) {
          console.log('1');
          item.quantity = item.quantity + 1;
          await Cart.findOneAndUpdate(
            { _id: cart._id, 'items._id': item._id },
            { 'items.$.quantity': item.quantity }
          );
          return res.send('Item Decreased');
        } else {
          return res.status(400).send('Item Not  Decreased');
        }
      }

      return res.status(400).send('Unable to perform Operation');
    }
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

//router.patch('/increment/:id', authorization, async (req, res) => {

//Update Cart Item Decrement

router.patch('/decrement/:id', authorization, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .lean();
    if (cart) {
      for (item of cart.items) {
        if (item._id.toString() === req.params.id) {
          console.log('1');
          item.quantity = item.quantity - 1;
          await Cart.findOneAndUpdate(
            { _id: cart._id, 'items._id': item._id },
            { 'items.$.quantity': item.quantity }
          );
          return res.send('Item Decreased');
        } else {
          return res.status(400).send('Item Not  Decreased');
        }
      }

      return res.status(400).send('Unable to perform Operation');
    }
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

// router.put('/:id', async (req, res) => {
//   try {
//     const updatedCart = await Cart.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedCart);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //GET USER CART
// router.get('/find/:userId', async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.params.userId });
//     res.status(200).json(cart);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //GET ALL

router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
