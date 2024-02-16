const sendSMS = async ({ to, text }) => {
  console.log("SMS", { to, text });

  const client = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Send an SMS message
  if (process.env.NODE_ENV === "production")
    await client.messages.create({
      body: text,
      from: process.env.TWILIO_SENDER_PHONE,
      to,
    });
};

module.exports = { sendSMS };
