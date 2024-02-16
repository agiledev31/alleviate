const express = require("express");
const { checkUser } = require("../controller/crudController");
const { getAddressAutoPlaces } = require("../controller/addressPlaceController");
const router = express.Router();

router.use("/", checkUser);
router.get("/getAddressAutoPlaces", getAddressAutoPlaces);

module.exports = router;
