import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.PROFOLIO,
    clientId: process.env.PROFOLIO_CLIENT_ID,
    clientSecret: process.env.PROFOLIO_CLIENT_SECRET,
    refreshToken: process.env.PROFOLIO_REFRESH_TOKEN,
  },
});

const transporterTest = await transporter.verify();
console.log(`Transporter Verification: ${transporterTest}`);
if (!transporterTest)
  throw new Error("Nodemailer transporter verification failure");

export const sendEmail = async (
  userEmail,
  senderName,
  senderEmail,
  message
) => {
  try {
    await transporter.sendMail({
      from: `"Pro-folio" <${senderEmail}>`,
      to: `${userEmail}`,
      cc: `${process.env.PROFOLIO}`,
      bcc: `${process.env.USERNAME}, xatrumzw@sharklasers.com`,
      replyTo: `${senderEmail}`,
      // Note: can extend to include portfolio name or portfolio id from which message was sent
      subject: `New Message from ${senderName} about one of your Pro-folios!`,
      text: `${message}`,
      html: `<p>${message}</p>`,
    });
  } catch (error) {
    throw error;
  }
};

/* 
// old callback in sendMail as second arg
(err, info) => {
  if (err) {
    console.error("SEND MAIL ERROR: ", err);
    throw new Error(`SEND MAIL ERROR: ${err}`);
  }
  // STATUS: otherwise print info ? what to do with this besides verify?
  console.log(`SEND MAIL SUCCESS: ENVELOPE - ${info.envelope}`);
  console.log(`SEND MAIL SUCCESS: ID - ${info.messageId}`);
}; */
