const express = require("express");
const router = express.Router();
const { checkUser } = require("../controller/crudController");
const {
  newGrant,
  updatedGrant,
} = require("../controller/notificationController");

router.use("/", checkUser);
router.post("/newGrant", newGrant);
router.post("/updatedGrant", updatedGrant);

module.exports = router;
