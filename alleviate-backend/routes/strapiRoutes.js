const express = require("express");
const router = express.Router();
const {
  landingPage,
  getBlog,
  getList,
  getCoreProgramMetrics,
} = require("../controller/strapiController");

router.get("/landingPage", landingPage);
router.get("/getBlog", getBlog);
router.get("/getList", getList);
router.get("/getCoreProgramMetrics", getCoreProgramMetrics);

module.exports = router;
