const { User, Suite, Program } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mailer");
const { sendSMS } = require("../utils/sms");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function generatePin() {
  const min = 1000; // Minimum 4-digit number
  const max = 9999; // Maximum 4-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateRandomCode = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
};

const register = async (req, res) => {
  try {
    const { phone, email, password, role, firstName, lastName, roleSelected } =
      req.body;

    if (role === "admin") throw new Error("Unable to register as admin");

    if (password.length < 8)
      throw new Error("Password must contain minimum 8 characters");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const roles = ["6576b96d64c53fe3203f3c5a", "6578cbed1bfcbbaa42565fcb"];
    if (role === "ngo-company") {
      roles.push("6576dab564c53fe3203f3c5f");
    }
    const user = new User({
      email,
      phone,
      role,
      password: hashedPassword,
      firstName,
      lastName,
      roles,
      roleSelected,
    });

    // Save the user to the database
    await user.save();

    res.json({});
  } catch (err) {
    res.status(400).send({
      message: err.code === 11000 ? "User already registered" : err.message,
    });
  }
};

const registerTeam = async (req, res) => {
  try {
    const { parent, phone, email, password, firstName, lastName } = req.body;

    if (password.length < 8)
      throw new Error("Password must contain minimum 8 characters");

    const hashedPassword = await bcrypt.hash(password, 10);

    const parentUser = await User.findById(parent);
    if (!parentUser) throw new Error("Master user not found");

    // Create a new user instance
    const user = new User({
      parent,
      email: email?.toLowerCase?.(),
      phone,
      roles: parentUser.roles,
      role: parentUser.role,
      password: hashedPassword,
      firstName: firstName?.replace?.(/[!?\[\]{}()*+\\^$|]/g, ""),
      lastName: lastName?.replace?.(/[!?\[\]{}()*+\\^$|]/g, ""),
    });
    await user.save();

    res.json({});
  } catch (err) {
    console.error(err.message);
    res.status(400).send({
      message: err.code === 11000 ? "User already registered" : err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SIGN, {
      expiresIn: "1h",
    });

    // Generate refresh token (optional)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SIGN_REFRESH,
      { expiresIn: "30d" }
    );

    // Return the token and refresh token to the client
    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a short reset token
    const resetToken = generateRandomCode(8); // Generate an 8-character alphanumeric code

    // Save the reset token to the user in the database
    user.resetToken = resetToken;
    await user.save();
    // Send the password reset token to the user (e.g., via email)

    res.json({ message: "Password reset token sent", resetToken });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find the user by the reset token
    const user = await User.findOne({ resetToken });

    // Check if the user exists
    if (!user) {
      throw new Error("Invalid reset token");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.resetToken = null; // Clear the reset token after password reset
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decodedToken = jwt.verify(refreshToken, process.env.JWT_SIGN_REFRESH);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: decodedToken.userId },
      process.env.JWT_SIGN,
      {
        expiresIn: "1h",
      }
    );

    // Generate refresh token (optional)
    const newRefreshToken = jwt.sign(
      { userId: decodedToken.userId },
      process.env.JWT_SIGN_REFRESH,
      { expiresIn: "30d" }
    );

    // Return the token and refresh token to the client
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const me = async (req, res) => {
  try {
    const onboardingStatus = {
      actionRequired: false,
      step: "",
      profileCompletion: 100,
    };

    // Priority logic: The first onboardingStatus.step that is applied below will happen latest (only if things that come after are not applied)

    const requiredProfileFields = [
      "line1",
      "city",
      "state",
      "zipCode",
      "country",
      "firstName",
      "lastName",
    ];
    const personalProfileCompletion =
      Math.round(
        (1 -
          requiredProfileFields.filter((key) => !!req.user[key]).length /
            requiredProfileFields.length) *
          100
      ) / 100;

    if (req.user.role === "ngo-company") {
      const TOTAL = 5;
      let profileCompletion = TOTAL;
      if (req.user.companyName === "") profileCompletion--;
      if (req.user.organizationType === "") profileCompletion--;
      if (req.user.businessId === "") profileCompletion--;
      // if (req.user.website === "") profileCompletion--;
      profileCompletion -= personalProfileCompletion;
      if (profileCompletion !== TOTAL)
        onboardingStatus.step = "profileCompletion";
      onboardingStatus.profileCompletion = Math.ceil(
        (profileCompletion / TOTAL) * 100
      );
    }

    if (req.user.role === "ngo-beneficiary") {
      const TOTAL = 1;
      let profileCompletion = TOTAL;
      profileCompletion -= personalProfileCompletion;
      if (profileCompletion !== TOTAL)
        onboardingStatus.step = "profileCompletion";
      onboardingStatus.profileCompletion = Math.ceil(
        (profileCompletion / TOTAL) * 100
      );
    }

    if (req.user.role === "expert") {
      const TOTAL = 2;
      let profileCompletion = TOTAL;
      if (req.user.expertiseAreas.length === 0) profileCompletion--;
      profileCompletion -= personalProfileCompletion;
      if (profileCompletion !== TOTAL)
        onboardingStatus.step = "profileCompletion";
      onboardingStatus.profileCompletion = Math.ceil(
        (profileCompletion / TOTAL) * 100
      );
    }

    if (req.user.role === "donor") {
      const TOTAL = 2;
      let profileCompletion = TOTAL;
      if (req.user.preferredCauses.length === 0) profileCompletion--;
      profileCompletion -= personalProfileCompletion;
      if (profileCompletion !== TOTAL)
        onboardingStatus.step = "profileCompletion";
      onboardingStatus.profileCompletion = Math.ceil(
        (profileCompletion / TOTAL) * 100
      );
    }

    if (req.user.role === "ngo-company" && !req.user.businessIdApproved)
      onboardingStatus.step = "businessIdApproved";

    if (!req.user.kycVerified && req.user.role === "ngo-company")
      onboardingStatus.step = "kycVerified";
    if (!req.user.roleSelected) onboardingStatus.step = "isRoleSelected";
    // if (!req.user.isPhoneVerified) onboardingStatus.step = "isPhoneVerified";
    if (!req.user.isEmailVerified) onboardingStatus.step = "isEmailVerified";

    if (onboardingStatus.step) onboardingStatus.actionRequired = true;

    res.json({ me: req.user, onboardingStatus });
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const updateMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      companyName: req.body.companyName,
      organizationType: req.body.organizationType,
      locale: req.body.locale,
      businessId: req.body.businessId,
      businessIdDocument: req.body.businessIdDocument,
      myDocuments: req.body.myDocuments,
      businessIdApproved: req.body.businessIdApproved,
      expertiseAreas: req.body.expertiseAreas,
      experienceYears: req.body.experienceYears,
      education: req.body.education,
      certifications: req.body.certifications,
      preferredCauses: req.body.preferredCauses,
      website: req.body.website,
      socialMediaLinks: req.body.socialMediaLinks,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      themeColor: req.body.themeColor,
      theme: req.body.theme,
      avatar: req.body.avatar,
      coverPhoto: req.body.coverPhoto,
      line1: req.body.line1,
      line2: req.body.line2,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      about: req.body.about,
      notification: req.body.notification,
      sector: req.body.sector,
      relevantDataset: req.body.relevantDataset,
      categoryNotifications: req.body.categoryNotifications,
      cvDocument: req.body.cvDocument,
      impactThemeInterests: req.body.impactThemeInterests,
    });

    if (req.body.businessIdDocument) {
      await User.findByIdAndUpdate(req.user._id, {
        businessIdDocumentRejected: null,
      });
    }
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const otpRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error("User not found");

    if (user.OTPExpire) {
      const currentTime = new Date();
      const otpExpirationTime = new Date(user.OTPExpire);

      if (currentTime < otpExpirationTime) {
        throw new Error("Your latest OTP is not expired yet");
      }
    }

    user.OTP = generatePin();
    user.OTPurpose = req.body.purpose;
    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + 300000);
    user.OTPExpire = expirationTime;

    if (req.body.purpose === "email") {
      await sendMail({
        to: user.email,
        subject: "Your Code",
        message: `Hello,\n\nYour One-Time Password (OTP) for secure verification is:\n\n${user.OTP}\n\nPlease use this OTP to complete your verification process. It will expire in 5 minutes, so make sure to enter it promptly.\n\nIf you did not request this OTP or have any concerns, please contact our support team immediately.\n\nThank you for choosing Alleviate!`,
      });
    }
    if (req.body.purpose === "phone") {
      await sendSMS({
        to: user.phone,
        text: `Hello, Your One-Time Password (OTP) for secure verification is: ${user.OTP}`,
      });
    }

    await user.save();
    res.json({
      message:
        req.body.purpose === "email"
          ? "Please check your inbox"
          : "We have sent you an SMS",
    });
  } catch (err) {
    res.status(400).send({
      message: err.code === 11000 ? "User already registered" : err.message,
    });
  }
};

const otpVerify = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error("User not found");

    if (user.OTP !== req.body.OTP) throw new Error("Wrong code");

    const currentTime = new Date();
    const otpExpirationTime = new Date(user.OTPExpire);

    if (currentTime >= otpExpirationTime) {
      await user.save();
      throw new Error("Your code has expired");
    }

    user.OTP = "";
    user.OTPPurpose = "";
    user.OTPExpire = null;

    if (user.OTPurpose === "email") {
      user.isEmailVerified = true;
    }
    if (user.OTPurpose === "phone") {
      user.isPhoneVerified = true;
    }

    await user.save();

    res.json({ message: "Successful" });
  } catch (err) {
    res.status(400).send({
      message: err.code === 11000 ? "User already registered" : err.message,
    });
  }
};

const requestKyc = async (req, res) => {
  try {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      return_url: `${req.body.origin}/auth/kyc`,
    });

    const user = await User.findById(req.user._id);
    user.KYCProcess = { id: session.id };
    await user.save();

    res.json({ follow: session.url });
  } catch (err) {
    res.status(400).send({
      message: err.code === 11000 ? "User already registered" : err.message,
    });
  }
};
const roleSelect = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.role = req.body.role;
    user.roleSelected = true;

    const roles = ["6576b96d64c53fe3203f3c5a", "6578cbed1bfcbbaa42565fcb"];
    if (user.role === "ngo-company") {
      roles.push("6576dab564c53fe3203f3c5f");
    }
    if (user.role === "ngo-beneficiary") {
      roles.push("6578b8231bfcbbaa42565fa3");
    }
    if (user.role === "donor") {
      roles.push("6578b8391bfcbbaa42565fa4");
    }
    if (user.role === "expert") {
      roles.push("6578b8461bfcbbaa42565fa5");
    }

    user.roles = roles;

    await user.save();

    res.json({});
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const generateLinkToInviteUser = async (req, res) => {
  try {
    const {
      program,
      invitePeopleEmails,
      isApplyDirect = false,
      type,
    } = req.body;
    let suite, assessment;
    if (type === "suite") {
      suite = await Suite.findOne({ _id: program._id });
    } else {
      suite = await Suite.findOne({ _id: program.suite._id });
      assessment = await Program.findOne({ _id: program._id });
    }

    if (assessment) {
      let emails = assessment?.invitedEmails || [];
      if (invitePeopleEmails && invitePeopleEmails.length > 0) {
        for (const email of invitePeopleEmails) {
          if (!emails.includes(email)) {
            emails.push(email);
          }
        }
      }

      if (emails && emails.length > 0) {
        await Program.findByIdAndUpdate(assessment._id, {
          invitedEmails: emails,
        });
      }
    }

    if (suite) {
      let emails = suite?.invitedEmails || [];
      if (invitePeopleEmails && invitePeopleEmails.length > 0) {
        for (const email of invitePeopleEmails) {
          if (!emails.includes(email)) {
            emails.push(email);
          }
        }
      }

      if (emails && emails.length > 0) {
        await Suite.findByIdAndUpdate(suite._id, {
          invitedEmails: emails,
        });
      }
    }

    const programUser = await User.findOne({ _id: program.user_id });
    let token;
    if (invitePeopleEmails && invitePeopleEmails.length > 0) {
      for (const email of invitePeopleEmails) {
        let expiresIn = null;

        if (program && program.endDate) {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const endTimestamp = Math.floor(
            new Date(program.endDate).getTime() / 1000
          );

          const remainingSeconds = endTimestamp - currentTimestamp;

          if (remainingSeconds > 0) {
            expiresIn = remainingSeconds;
          }
        }

        const payload = {
          userId: programUser._id,
          userRole: "ngo-beneficiary",
          programId: program._id,
          email: email,
          expiresIn: expiresIn,
        };

        const jwtOptions = expiresIn !== null ? { expiresIn } : {};
        const inviteUserToken = jwt.sign(
          payload,
          process.env.JWT_SIGN,
          jwtOptions
        );
        token = inviteUserToken;
        const link = `${req.body.baseURL}/auth/register?token=${inviteUserToken}`;
        if (email) {
          await sendMail({
            to: email,
            subject: "Invitation To Alleviate",
            message:
              `Hello,
               \n\nYour Invitation Link is:\n\n${link}\n\nPlease use this Link to register.` +
              `${
                expiresIn !== null
                  ? `\nIt will expire at ${new Date(
                      Date.now() + expiresIn * 1000
                    ).toLocaleString()}, so make sure to enter it promptly.`
                  : ""
              }` +
              `\n\nThank you for choosing Alleviate!`,
          });
        }
      }
    } else {
      if (isApplyDirect === true) {
        let expiresIn = null;
        if (program && program.endDate) {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const endTimestamp = Math.floor(
            new Date(program.endDate).getTime() / 1000
          );

          const remainingSeconds = endTimestamp - currentTimestamp;

          if (remainingSeconds > 0) {
            expiresIn = remainingSeconds;
          }
        }

        const payload = {
          userId: programUser._id,
          userRole: programUser.role,
          programId: program._id,
          expiresIn: expiresIn,
        };
        const jwtOptions = expiresIn !== null ? { expiresIn } : {};
        token = jwt.sign(payload, process.env.JWT_SIGN, jwtOptions);
      }
    }

    res.json({ token: token });
  } catch (err) {
    res.status(400).send({
      message: err.code === 11000 ? "User already registered" : err.message,
    });
  }
};

module.exports = {
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
};
