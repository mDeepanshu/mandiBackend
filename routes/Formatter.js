// class Formatter {
//     static format(body, statusCode) {
//         switch (statusCode) {
//             case 400:
//                 return {
//                     status: 400,
//                     title: "Bad Request",
//                     message: body
//                 }
//             case 200:
//                 return {
//                     status: 200,
//                     title: "Successful",
//                     message: body
//                 }
//         }
//     }
// }

// module.exports = Formatter
const express = require("express");

const router = express.Router();

router.get("/add-product", (req, res, next) => {
  res.send(
    '<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>'
  );
});

router.get("/", (req, res, next) => {
  res.send("<h1>Hello from Express!</h1>");
});

router.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

module.exports = router;
