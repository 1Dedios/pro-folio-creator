import nodemailer from "nodemailer";

export default async function sendEmail(
  userEmail,
  senderName,
  senderEmail,
  message
) {
  try {
    const transporterTest = await transporter.verify();
    if (!transporterTest)
      throw new Error("Nodemailer transporter verification failure");

    // returns info object with message ID, if necessary
    await transporter.sendMail({
      from: `"Pro-folio" <${senderEmail}>`,
      to: `${userEmail}`,
      cc: `${process.env.PROFOLIO}`,
      bcc: `${process.env.USERNAME}`,
      replyTo: `${senderEmail}`,
      // Note: can extend to include portfolio name or portfolio id from which message was sent
      subject: `New Message from ${senderName} about one of your Pro-folios!`,
      text: `${message}`,
      html: `<p>${message}</p>`,
    });
  } catch (error) {
    throw error;
  }
}

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
