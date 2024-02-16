const express = require("express");
const router = express.Router();
const { getSurveys } = require("../controller/statsController");
const { getAssessmentSurveys } = require("../controller/statsController");
const { checkUser } = require("../controller/crudController");

router.use("/", checkUser);
router.get("/getSurveys", getSurveys);
router.get("/getAssessmentSurveys", getAssessmentSurveys);

module.exports = router;
