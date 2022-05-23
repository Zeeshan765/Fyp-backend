const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cloudinary = require("../utilis/cloudinary");
const multer = require("multer");
const Product = require("../models/product");
const Component = require("../models/component");
const Comment = require("../models/comment");
const authorization = require("../middleware/authorization");
const admin = require("../middleware/admin");
const validateComponent = require("../middleware/validateComponent");

//const DIR = './public/';
const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, './public');
  // },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, mongoose.Types.ObjectId() + "-" + fileName);
    //cb(null, file.originalname);
  },
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

//get simple component without pagination

router.get("/", async (req, res) => {
  let components = await Component.find();

  return res.json(components);
});

//getall the component--->user---->with pagination
router.get("/simple", async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 8);
  let skipRecords = perPage * (page - 1);

  let components = await Component.find().skip(skipRecords).limit(perPage);

  let total = await Component.countDocuments();
  return res.json({ total, components });
});

//getall the component---->admin
router.get("/all", authorization, admin, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);

  let components = await Component.find().skip(skipRecords).limit(perPage);

  let total = await Component.countDocuments();
  return res.json({ total, components });
});

router.get("/:category", async (req, res) => {
  const category = req.params.category;
  let components = await Component.find({ category: { $eq: category } });
  return res.json(components);
});

//get single component-->user
router.get("/find/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    let component = await Component.findById(id);
    if (!component)
      return res.status(400).send("component With given ID is not present");
    return res.send(component);
  } catch (err) {
    return res.status(400).send("Invalid ID"); // format of id is not correct
  }
});

//get single component--->admin
router.get("/find/admin/:id", authorization, admin, async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    let component = await Component.findById(id);
    if (!component)
      return res.status(400).send("component With given ID is not present");
    return res.send(component);
  } catch (err) {
    return res.status(400).send("Invalid ID"); // format of id is not correct
  }
});

//Insert a component

router.post(
  "/",
  upload.single("image"),
  authorization,
  admin,
  validateComponent,
  async (req, res) => {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    //res.json(result);
    console.log(result);
    console.log(req.body);
    let component = new Component();
    component.name = req.body.name;
    component.rgb = req.body.rgb;
    component.price = req.body.price;
    component.description = req.body.description;
    component.socket = req.body.socket;
    component.ramSupport = req.body.ramSupport;
    component.category = req.body.category;
    component.size = req.body.size;
    component.watt = req.body.watt;
    component.site = req.body.site;
    component.info1 = req.body.info1;
    component.info2 = req.body.info2;
    component.info3 = req.body.info3;
    component.info4 = req.body.info4;
    component.company = req.body.company;
    component.coolingsockets = req.body.coolingsockets;
    component.picture = result.secure_url;
    component.cloudinary_id = result.public_id;
    await component.save();
    return res.json(component);
  }
);

//Delete a component

router.delete("/:id", authorization, admin, async (req, res) => {
  let component = await Component.findByIdAndDelete(req.params.id);
  // Delete image from cloudinary
  await cloudinary.uploader.destroy(component.cloudinary_id);
  return res.json(component);
});

//Update a component

router.put(
  "/:id",
  upload.single("image"),
  authorization,
  admin,
  validateComponent,
  async (req, res) => {
    try {
      let component = await Component.findById(req.params.id);

      // Upload image to cloudinary
      let result;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(component.cloudinary_id);
      const data = {
        name: req.body.name || component.name,
        price: req.body.price || component.price,
        rgb: req.body.rgb || component.rgb,
        info1: req.body.info1 || component.info1,
        info2: req.body.info2 || component.info2,
        info3: req.body.info3 || component.info3,
        info4: req.body.info4 || component.info4,
        socket: req.body.socket || component.socket,
        ramSupport: req.body.ramSupport || component.ramSupport,
        size: req.body.size || component.size,
        watt: req.body.watt || component.watt,

        site: req.body.site || component.site,

        coolingsockets: req.body.coolingsockets || component.coolingsockets,

        description: req.body.description || component.description,
        company: req.body.company || component.company,
        category: req.body.category || component.category,

        picture: result?.secure_url || component.picture,
        cloudinary_id: result?.public_id || component.cloudinary_id,
      };
      component = await Component.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.json(component);
    } catch (err) {
      console.log(err);
    }
  }
);

//Search a Component
router.get("/search/:keyword", authorization, async (req, res) => {
  let components = await Component.find({
    name: { $regex: req.params.keyword, $options: "i" },
  });
  return res.json(components);
});

// //Filter a Component by price
// router.get('/filter/:price', async (req, res) => {
// let components = await Component.find({price: {$lte: req.params.price}});
//   return res.json(components);   //return res.json(components);
// })

//filter a product by price range between two values  //$gte
router.get("/filter/:min/:max", async (req, res) => {
  //$eq
  let components = await Component.find({
    price: { $gte: req.params.min, $lte: req.params.max },
  });
  //let products = await Product.find({ price: { $regex: req.params.price, $options: 'i' } });\
  return res.json(components); //return res.json(components);
});

//post comments on product
// router.post('/:id/comments', authorization, async (req, res) => {
//   let product = await Component.findById(req.params.id);
//   let comment = new Comment({
//     comment: req.body.comment,
//     rating: req.body.rating,
//     user: req.user.name,
//     product: product._id,
//   });
//   await comment.save();
//   product.comments.push(comment);
//   await product.save();
//   console.log(comment);
//   return res.json(comment);
// });

//post comment  on product after order is delivered
router.post("/comments/:id", authorization, async (req, res) => {
  console.log(req.params.id);
  if (req.body.type === "Component") {
    try {
      let product = await Component.findOne({ _id: req.params.id });
      console.log(product);
      let comment = new Comment({
        comment: req.body.comment,
        rating: req.body.rating,
        user: req.user.name,
        product: req.params.id,
      });
      await comment.save();
      product.comments.push(comment);
      await product.save();
      console.log(comment);
      return res.json(comment);
    } catch (err) {
      console.log(err);
    }
  } else if (req.body.type === "Product") {
    {
      try {
        let product = await Product.findOne({
          _id: req.params.id,
        });
        let comment = new Comment({
          comment: req.body.comment,
          rating: req.body.rating,
          user: req.user.name,
          product: req.params.id,
        });
        await comment.save();

        product.comments.push(comment);
        await product.save();
        console.log(comment);
        return res.json(comment);
      } catch (err) {
        console.log(err);
      }
    }
  } else if (req.body.type === "Custom") {
    {
      try {
        let product = await Product.findOne({ _id: req.params.id });
        let comment = new Comment({
          comment: req.body.comment,
          rating: req.body.rating,
          user: req.user.name,
          product: req.params.id,
        });
        await comment.save();

        product.comments.push(comment);
        await product.save();
        console.log(comment);
        return res.json(comment);
      } catch (err) {
        console.log(err);
      }
    }
  }
});

//get comments on product
router.get("/:id/get/comments", authorization, async (req, res) => {
  let product = await Component.findById(req.params.id).populate("comments");
  console.log(product);
  return res.json(product.comments);
});

// let component = await Component.findByIdAndUpdate(req.params.id);
// await cloudinary.uploader.destroy(component.cloudinary_id);
// const result = await cloudinary.uploader.upload(req.file.path);
// //res.json(result);
// component.name = req.body.name;
// component.price = req.body.price;
// component.description = req.body.description;
// component.socket = req.body.socket;
// component.ramSupport = req.body.ramSupport;
// component.company = req.body.company;
// component.size = req.body.size;
// component.info1 = req.body.info1;
// component.info2 = req.body.info2;
// component.info3 = req.body.info3;
// component.info4 = req.body.info4;
// component.watt = req.body.watt;
// component.coolingsockets = req.body.coolingsockets
// component.category = req.body.category;
// component.picture = result.secure_url;
// component.cloudinary_id = result.public_id;
// await component.save();
// return res.json(component);

/*router.put('/:id', async (req, res) => {
  let component = await component.findByIdAndUpdate(req.params.id, req.body);

  return res.send(component);
});*/
module.exports = router;
