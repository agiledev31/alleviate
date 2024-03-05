const express = require("express");
const router = express.Router();
const { checkUser } = require("../controller/crudController");
const {
  searchUsers,
  inviteUser,
  updateUser,
  deleteTeamMember,
} = require("../controller/userController");

router.use("/", checkUser);
router.post("/searchUsers", searchUsers);
router.post("/inviteUser", inviteUser);
router.put("/updateUser", updateUser);
router.delete("/deleteTeamMember", deleteTeamMember);

module.exports = router;
