const express = require("express");
const router = express.Router();
const { checkUser } = require("../controller/crudController");
const { getDashboardDetails } = require("../controller/dashboardController");

router.use("/", checkUser);
router.get("/getDashboardDetails", getDashboardDetails);

module.exports = router;
