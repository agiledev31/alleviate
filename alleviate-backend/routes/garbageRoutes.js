const express = require("express");
const router = express.Router();
const {
  approveCompanyApplication,
  rejectCompanyApplication,
} = require("../controller/garbageController");
const { checkUser } = require("../controller/crudController");

router.use("/", checkUser);
router.put("/approveCompanyApplication", approveCompanyApplication);
router.delete("/rejectCompanyApplication", rejectCompanyApplication);

module.exports = router;
