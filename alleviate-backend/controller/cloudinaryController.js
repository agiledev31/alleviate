const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
  api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET,
  secure: true,
});

const generateSignature = async (req, res) => {
  try {
    const signatureString = req.body.signatureString;
    const signature = cloudinary.utils.api_sign_request(
      signatureString,
      process.env.REACT_APP_CLOUDINARY_API_SECRET
    );

    res.json({ signature });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = {
  generateSignature,
};
