const express = require("express");
const router = express.Router();
const { checkUser } = require("../controller/crudController");
const { getDashboardDetails, getMySuites } = require("../controller/dashboardController");

router.use("/", checkUser);
router.get("/getDashboardDetails", getDashboardDetails);
router.get("/getMySuites", getMySuites);

module.exports = router;
