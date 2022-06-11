const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const cloudinary = require('../utilis/cloudinary');
const multer = require('multer');
const Product = require('../models/product');
const Comment = require('../models/comment');
const authorization = require('../middleware/authorization');
const admin = require('../middleware/admin');
const validateProduct = require('../middleware/validateProduct');
//const DIR = './public/';
const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, './public');
  // },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, mongoose.Types.ObjectId() + '-' + fileName);
    //cb(null, file.originalname);
  },
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

//getall the product
router.get('/pagination', async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 8);
  let skipRecords = perPage * (page - 1);

  let products = await Product.find().skip(skipRecords).limit(perPage);

  let total = await Product.countDocuments();
  return res.send({ total, products });
});

//get  Products-->without pagination
router.get('/build', async (req, res) => {
  let products = await Product.find();
  return res.send(products);
});

//getall the product---->admin
router.get('/all', authorization, admin, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);

  let products = await Product.find().sort({ _id: -1 }).skip(skipRecords).limit(perPage);

  let total = await Product.countDocuments();
  return res.send({ total, products });
});

router.get('/:category', async (req, res) => {
  const category = req.params.category;
  console.log(category);
  let products = await Product.find({ category: { $eq: category } });
  return res.json(products);
});

//get single product
router.get('/find/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);

  try {
    let product = await Product.findById(id);
    if (!product)
      return res.status(400).send('Product With given ID is not present');
    return res.json(product);
  } catch (err) {
    return res.status(400).send('Invalid ID'); // format of id is not correct
  }
});

//get single product-->admin
router.get('/find/admin/:id', authorization, admin, async (req, res) => {
  const id = req.params.id;
  console.log(id);

  try {
    let product = await Product.findById(id);
    if (!product)
      return res.status(400).send('Product With given ID is not present');
    return res.json(product);
  } catch (err) {
    return res.status(400).send('Invalid ID'); // format of id is not correct
  }
});

// //get low budget product
// router.get('/get/lowbuild', async (req, res) => {
//   let page = Number(req.query.page ? req.query.page : 1);
//   let perPage = Number(req.query.perPage ? req.query.perPage : 1);
//   let skipRecords = perPage * (page - 1);

//   let products = await Product.find().skip(skipRecords).limit(perPage);
//   let filterproduct = products.filter(
//     (product) => product.category === 'low budget'
//   );
//   let total = await Product.countDocuments();

//   return res.send({ total, filterproduct });
// });

// //get med budget product
// router.get('/get/medbuild', async (req, res) => {
//   let products = await Product.find();
//   let filterproduct = products.filter(
//     (product) => product.category === 'med budget'
//   );
//   return res.send(filterproduct);
// });

// //get low budget product
// router.get('/get/highbuild', async (req, res) => {
//   let products = await Product.find();
//   let filterproduct = products.filter(
//     (product) => product.category === 'high budget'
//   );
//   return res.send(filterproduct);
// });

//Insert a Product

router.post(
  '/',
  upload.single('image'),
  authorization,
  admin,
  validateProduct,
  async (req, res) => {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    //res.json(result);
    console.log(result);
    console.log(req.body);
    let product = new Product();
    product.name = req.body.name;
    product.price = req.body.price;
    product.info1 = req.body.info1;
    product.info2 = req.body.info2;
    product.info3 = req.body.info3;
    product.info4 = req.body.info4;
    product.description = req.body.description;
    product.company = req.body.company;
    product.category = req.body.category;
    product.picture = result.secure_url;
    product.cloudinary_id = result.public_id;
    await product.save();
    return res.json(product);
  }
);

//Delete a Product

router.delete('/:id', authorization, admin, async (req, res) => {
  let product = await Product.findByIdAndDelete(req.params.id);
  // Delete image from cloudinary
  await cloudinary.uploader.destroy(product.cloudinary_id);
  return res.json(product);
});
//upload.single('image'),
//Update a Product
// router.put('/:id',  async (req, res) => {
//   try {

//     // const result = await cloudinary.uploader.upload(req.file.path);
//     // console.log(result);
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,

//       },

//       { new: true }
//     );
//     console.log(product);
//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json(err);
//   }
//let product = await Product.findByIdAndUpdate(req.params.id);

// await cloudinary.uploader.destroy(product.cloudinary_id);
// const result = await cloudinary.uploader.upload(req.file.path);
// //res.json(result);
// product.name = req.body.name;
// product.price = req.body.price;
// product.description = req.body.description;
// product.company = req.body.company;
// product.info1 = req.body.info1;
// product.info2 = req.body.info2;
// product.info3 = req.body.info3;
// product.info4 = req.body.info4;
// product.category = req.body.category;
// product.picture = result.secure_url;
// product.cloudinary_id = result.public_id;
// await product.save();
// return res.json(product);

// router.patch('/:id', upload.single('image'), async (req, res) => {
//   //const result = await cloudinary.uploader.upload(req.file.path);

//     const newUserData = {
//       name : req.body.name,
//         price : req.body.price,
//        description : req.body.description,
//         company : req.body.company,
//         info1 : req.body.info1,
//         info2 : req.body.info2,
//         info3 : req.body.info3,
//         info4 : req.body.info4,
//         category : req.body.category,
//         // picture : result.secure_url,
//         // cloudinary_id : result.public_id,
//     };

//   try {
//     const user = await Product.findByIdAndUpdate(req.params.id, newUserData, {
//       new: true,
//     });

//     // await user.save();
//     //let updatedToken = user.generateToken();
//     console.log(user);
//     return res.status(200).json(user);
//   } catch (error) {
//     console.log()
//     return res.status(500).json('User Does Not  Exsist');
//   }

//   });

router.put(
  '/:id',
  upload.single('image'),
  authorization,
  admin,
  validateProduct,
  async (req, res) => {
    try {
      let product = await Product.findById(req.params.id);

      // Upload image to cloudinary
      let result;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(product.cloudinary_id);
      const data = {
        name: req.body.name || product.name,
        price: req.body.price || product.price,
        info1: req.body.info1 || product.info1,
        info2: req.body.info2 || product.info2,
        info3: req.body.info3 || product.info3,
        info4: req.body.info4 || product.info4,
        description: req.body.description || product.description,
        company: req.body.company || product.company,
        category: req.body.category || product.category,

        picture: result?.secure_url || product.picture,
        cloudinary_id: result?.public_id || product.cloudinary_id,
      };
      product = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.json(product);
    } catch (err) {
      console.log(err);
    }
  }
);
//Search a Product
router.get('/search/:keyword', authorization, async (req, res) => {
  let products = await Product.find({
    name: { $regex: req.params.keyword, $options: 'i' },
  });
  return res.json(products);
});

// //Filter a Price by price
// router.get('/filter/:price', async (req, res) => {
//   //$eq
//  let products = await Product.find({price: {$lte: req.params.price}});
// //let products = await Product.find({ price: { $regex: req.params.pricei, $options: 'i' } });

//   return res.json(products);   //return res.json(components);
// })
//filter a product by price range between two values  //$gte
router.get('/filter/:min/:max', async (req, res) => {
  //$eq
  let products = await Product.find({
    price: { $gte: req.params.min, $lte: req.params.max },
  });
  //let products = await Product.find({ price: { $regex: req.params.price, $options: 'i' } });\
  return res.json(products); //return res.json(components);
});

//post comments on product
router.post('/:id/comments', authorization, async (req, res) => {
  let product = await Product.findById(req.params.id);
  let comment = new Comment({
    comment: req.body.comment,
    rating: req.body.rating,
    user: req.user.name,
    product: product._id,
  });
  await comment.save();
  product.comments.push(comment);
  await product.save();
  console.log(comment);
  return res.json(comment);
});

//post comment  on product after order is delivered
router.post('/:id/comments/:orderId', authorization, async (req, res) => {
  if (req.body.type === 'Component') {
    let product = await Component.findById(req.params.id);
    let comment = new Comment({
      comment: req.body.comment,
      rating: req.body.rating,
      user: req.user.name,
      product: product._id,
    });
    await comment.save();
    product.comments.push(comment);
    await product.save();
    console.log(comment);
    return res.json(comment);
  } else if (req.body.type === 'Product') {
    {
      let product = await Product.findById(req.params.id);
      let comment = new Comment({
        comment: req.body.comment,
        rating: req.body.rating,
        user: req.user.name,
        product: product._id,
      });
      await comment.save();

      product.comments.push(comment);
      await product.save();
      console.log(comment);
      return res.json(comment);
    }
  } else if (req.body.type === 'Custom') {
    {
      let product = await Product.findById(req.params.id);
      let comment = new Comment({
        comment: req.body.comment,
        rating: req.body.rating,
        user: req.user.name,
        product: product._id,
      });
      await comment.save();

      product.comments.push(comment);
      await product.save();
      console.log(comment);
      return res.json(comment);
    }
  }
});

//get comments on product
router.get('/:id/get/comments', authorization, async (req, res) => {
  let product = await Product.findById(req.params.id).populate('comments');
  console.log(product);
  console.log(product.comments);
  return res.json(product.comments);
});

//post rating and review on product
router.post('/:id/ratings', authorization, async (req, res) => {
  let product = await Product.findById(req.params.id);
  let rating = new Rating({
    rating: req.body.rating,
    user: req.user._id,
    product: product._id,
  });
  await rating.save();
  product.ratings.push(rating);
  await product.save();
  return res.json(rating);
});

//get ratings and reviews on product
router.get('/:id/ratings', authorization, async (req, res) => {
  let product = await Product.findById(req.params.id);
  return res.json(product.ratings);
});

// if(req.file){
//   const updatedata= {
//     name : req.body.name,
//   price : req.body.price,
//  description : req.body.description,
//   company : req.body.company,
//   info1 : req.body.info1,
//   info2 : req.body.info2,
//   info3 : req.body.info3,
//   info4 : req.body.info4,
//   category : req.body.category,
//   picture : result.secure_url,
//   cloudinary_id : result.public_id,
//   }
// product.name = req.body.name;
//   product.price = req.body.price;
//   product.info1 = req.body.info1;
//   product.info2 = req.body.info2;
//   product.info3 = req.body.info3;
//   product.info4 = req.body.info4;
//   product.description = req.body.description;
//   product.company = req.body.company;
//   product.category = req.body.category;
//   product.picture = result.secure_url;
//   product.cloudinary_id = result.public_id;

// }else{
//   let updatedata= {
//     name : req.body.name,
//   price : req.body.price,
//  description : req.body.description,
//   company : req.body.company,
//   info1 : req.body.info1,
//   info2 : req.body.info2,
//   info3 : req.body.info3,
//   info4 : req.body.info4,
//   category : req.body.category,

//   }

// }
// let product = await Product.findByIdAndUpdate(req.params.id, updatedata,
//   {
//   new: true,
// });

// // await user.save();
// //let updatedToken = user.generateToken();
// console.log(req.body);
// return res.status(200).json(product);
// try {
//   let product = await Product.findByIdAndUpdate(req.params.id, updatedata,
//     {
//     new: true,
//   });

//   // await user.save();
//   //let updatedToken = user.generateToken();
//   console.log(req.body);
//   return res.status(200).json(product);
// } catch (error) {
//   return res.status(500).json('Product Cant be updated');
// }

/*router.put('/:id', async (req, res) => {
  let product = await Product.findByIdAndUpdate(req.params.id, req.body);

  return res.send(product);
});*/
module.exports = router;
