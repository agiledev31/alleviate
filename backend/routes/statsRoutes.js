const express = require("express");
const router = express.Router();
const {
  getAssessmentSurveys,
  getDataSummary,
  getSurveys,
} = require("../controller/statsController");
const { checkUser } = require("../controller/crudController");

router.use("/", checkUser);
router.get("/getSurveys", getSurveys);
router.get("/getAssessmentSurveys", getAssessmentSurveys);
router.get("/getDataSummary", getDataSummary);

module.exports = router;
