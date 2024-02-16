const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fs = require("fs");

function GetMailBody(body) {
  return new Promise((resolve, reject) => {
    if (typeof body !== "string") return "";

    let HTMLTemplateVariables = {
      emailtext: body,
    };

    fs.readFile(
      __dirname + "/emailtemplate/index.html",
      "utf8",
      function (err, html) {
        if (err || typeof html !== "string") {
          reject("Could not load HTML source");
        }

        Object.keys(HTMLTemplateVariables).forEach((key) => {
          let strRegex = `{{${key}}}`;
          let regex = new RegExp(strRegex, "g");
          try {
            html = html.replace(regex, HTMLTemplateVariables[key]);
          } catch (err) {
            reject("Could not load HTML source");
          }
        });
        resolve(html);
      }
    );
  });
}

const sendMail = async ({
  subject,
  cc,
  bcc,
  to,
  replyTo,
  message,
  attachments = [],
}) => {
  console.log(
    `New email sent: ${JSON.stringify({
      subject,
      cc,
      bcc,
      to,
      replyTo,
      message,
    })}`
  );

  const sender = process.env.SENDGRID_SENDER_MAIL;
  const html = await GetMailBody(message.replace(/\n/g, "<br>"));
  const emailMessage = {
    to, // Replace with the recipient email address
    bcc,
    cc,
    from: sender,
    replyTo: replyTo ?? sender,
    subject,
    text: message,
    html,
    attachments,
  };

  try {
    if (process.env.NODE_ENV === "production") await sgMail.send(emailMessage);
  } catch (e) {}
};

module.exports = { sendMail };
