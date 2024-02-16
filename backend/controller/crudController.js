const { User } = require("../models");
const jwt = require("jsonwebtoken");

const checkUser = async (req, res, next) => {
  try {
    const accessToken = req.headers.access_token;

    // Verify and decode the access token
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SIGN);

    // Extract the userId from the decoded token
    const userId = decodedToken.userId;

    // Find the user in the database
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      throw new Error("");
    }

    // Set the user object in the request for further use
    req.user = Object.assign({}, user)?._doc;

    delete req.user.resetToken;
    delete req.user.password;
    delete req.user.__v;

    next();
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const checkPermission = async (action, req, res, next) => {
  const user = await User.findById(req.user._id).populate("roles");

  const modelName = req.query.ModelName;

  console.log(user.roles);
  if (
    user.roles.every(
      (modelPermission) =>
        !modelPermission[action].includes("ANY") &&
        (!modelPermission || !modelPermission[action].includes(modelName))
    )
  )
    return res.status(403).json({ message: "Permission denied" });

  const concernedRoles = user.roles.filter(
    (role) => role[action].includes(modelName) || role[action].includes("ANY")
  );
  const conditions = concernedRoles.some((c) => c.conditions.length === 0)
    ? []
    : concernedRoles.map((c) => [...c.conditions]).flat();
  req.conditions = Object.assign([], conditions);

  next();
};
const checkWritePermission = (req, res, next) =>
  checkPermission("writeAccess", req, res, next);
const checkReadPermission = (req, res, next) =>
  checkPermission("readAccess", req, res, next);

module.exports = {
  checkUser,
  checkWritePermission,
  checkReadPermission,
};
