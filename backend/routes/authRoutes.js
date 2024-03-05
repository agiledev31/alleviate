const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  requestPasswordReset,
  resetPassword,
  me,
  updateMe,
  otpRequest,
  otpVerify,
  requestKyc,
  roleSelect,
  generateLinkToInviteUser,
  registerTeam,
} = require("../controller/authController");
const { checkUser } = require("../controller/crudController");

router.post("/register", register);
router.post("/registerTeam", registerTeam);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/requestPasswordReset", requestPasswordReset);
router.post("/resetPassword", resetPassword);
router.get("/me", checkUser, me);
router.put("/updateMe", checkUser, updateMe);
router.post("/otpRequest", checkUser, otpRequest);
router.post("/otpVerify", checkUser, otpVerify);
router.post("/requestKyc", checkUser, requestKyc);
router.post("/roleSelect", checkUser, roleSelect);
router.post("/generateLinkToInviteUser", generateLinkToInviteUser);

module.exports = router;
