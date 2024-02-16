const express = require("express");
const router = express.Router();
const { checkUser } = require("../controller/crudController");
const { generateSignature } = require("../controller/cloudinaryController");

router.use("/", checkUser);
router.post("/generateSignature", generateSignature);

module.exports = router;
