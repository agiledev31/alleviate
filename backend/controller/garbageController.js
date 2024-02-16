const { User } = require("../models");

const approveCompanyApplication = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      businessIdApproved: true,
      businessIdDocumentRejected: null,
    });

    res.json({});
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};
const rejectCompanyApplication = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      businessIdDocument: "",
      businessIdDocumentRejected: {
        reason: "Rejected for simulation purpose.",
        timestamp: new Date(),
      },
    });

    res.json({});
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = {
  approveCompanyApplication,
  rejectCompanyApplication,
};
