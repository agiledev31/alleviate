const { Suite, User } = require("../models");
const { sendMail } = require("../utils/mailer");

const newGrant = async (req, res) => {
  try {
    const suite = await Suite.findById(req.body.id);

    const users = await User.find({
      "notification.newgrantproposals": true,
      impactThemeInterests: { $in: [suite.category] },
    });

    await Promise.all(
      users.map(async (user) => {
        await sendMail({
          to: user.email,
          subject: "New Grant Opportunity",
          message: `Hello ${user.firstName},\n\nA new grant opportunity that matches your interests has been posted on our platform. Please visit <a href="${req.body.origin}/dashboard/suitedetail?id=${suite.id}">${suite.name}</a> to browse it.\n\nThank you for choosing Alleviate!`,
        });
      })
    );

    res.json({});
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  } finally {
  }
};

const updatedGrant = async (req, res) => {
  try {
    const suite = await Suite.findById(req.body.id);

    const users = await User.find({
      "notification.grantproposalupdates": true,
      impactThemeInterests: { $in: [suite.category] },
    });

    await Promise.all(
      users.map(async (user) => {
        await sendMail({
          to: user.email,
          subject: "Updated Grant Opportunity",
          message: `Hello ${user.firstName},\n\nWe have updates on the grant opportunity that matches your interests. Please visit <a href="${req.body.origin}/dashboard/suitedetail?id=${suite.id}">${suite.name}</a> to see the updates.\n\nThank you for choosing Alleviate!`,
        });
      })
    );

    res.json({});
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  } finally {
  }
};

module.exports = {
  newGrant,
  updatedGrant,
};
