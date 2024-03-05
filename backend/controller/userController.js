const { User } = require("../models");
const { sendMail } = require("../utils/mailer");
const jwt = require("jsonwebtoken");

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const searchUsers = async (req, res) => {
  try {
    if (req.user.partner) throw new Error("No access");
    const { page, limit, sort, text, filter } = req.body;

    const filterQuery = {
      parent: req.user._id,
      ...filter,
    };
    const firstQuery = req.body.text
      ? {
          $text: { $search: req.body.text },
          ...filterQuery,
        }
      : filterQuery;

    const secondQuery = req.body.text
      ? { score: { $meta: "textScore" } }
      : undefined;

    const result = await User.find(firstQuery, secondQuery)
      .sort(sort)
      .limit(limit)
      .skip(limit * (page - 1));

    const total = await User.countDocuments(firstQuery, secondQuery);

    res.json({ result, total, page, limit, text });
  } catch (err) {
    console.error(err?.message);
    res.status(400).send({
      message: err.message,
    });
  }
};

const inviteUser = async (req, res) => {
  try {
    if (req.user.parent) throw new Error("No access");

    const { phone, email, firstName, lastName } = req.body;
    if (!email) throw new Error("Please provide an email");
    if (!validateEmail(email)) throw new Error("Please provide a valid email");
    if (!firstName) throw new Error("Firstname is required");
    if (!lastName) throw new Error("Lastname is required");

    let user = await User.findOne({ email });
    if (user) throw new Error("This email is not available");

    const inviteToken = jwt.sign(
      {
        parent: req.user._id,
        email,
        role: req.user.role,
        firstName,
        lastName,
        phone,
      },
      process.env.JWT_SIGN,
      { expiresIn: "365d" }
    );

    await sendMail({
      to: email,
      subject: "You are invited to join our team",
      message: `Hello ${firstName},\n\nYou have been invited to join as a team member. Please follow the link below to set up your account:\n\n${req.body.origin}/join?token=${inviteToken}`,
    });

    res.json({ message: "Invitation sent successfully" });
  } catch (err) {
    console.error(err?.message);
    res.status(400).send({
      message: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.user.parent) throw new Error("No access");

    await User.findOneAndUpdate(
      {
        _id: req.query.id,
        parent: req.user._id,
      },
      {
        firstName: req.body.firstName?.replace?.(/[!?\[\]{}()*+\\^$|]/g, ""),
        lastName: req.body.lastName?.replace?.(/[!?\[\]{}()*+\\^$|]/g, ""),
        blocked: req.body.blocked,
      }
    );
    res.json({});
  } catch (err) {
    console.error(err?.message);
    res.status(400).send({
      message: err.message,
    });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    if (req.user.parent) throw new Error("No access");

    await User.findOneAndDelete({
      _id: req.query.id,
      parent: req.user._id,
    });

    res.json({});
  } catch (err) {
    console.error(err?.message);
    res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = {
  searchUsers,
  inviteUser,
  updateUser,
  deleteTeamMember,
};
