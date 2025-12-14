import { Router } from "express";
import { createMessage } from "../data/messages.js";
import { getPortfolioById } from "../data/portfolios.js";
import { getUserById } from "../data/users.js";
import sendEmail from "../services/nodemailer/email.js";
import { validateString, validateEmail, escapeHTML } from "../helpers.js";

const router = Router();

router
  .route("/:portfolioId")
  .get(async (req, res) => {
    try {
      const portfolioId = req.params.portfolioId;

      return res.render("contact-form", {
        pageTitle: "Contact Form",
        portfolioId: portfolioId,
      });
    } catch (e) {
      return res.sendStatus(500).json({ error: e.message });
    }
  })
  .post(async (req, res) => {
    const { senderName, senderEmail, message } = req.body;
    const validationErrors = {};
    let validatedName;
    let validatedEmail;
    let validatedMessage;

    // xss mitigation
    let fieldsArr = [senderName, senderEmail, message];
    fieldsArr = escapeHTML(fieldsArr);

    try {
      validatedName = validateString(fieldsArr[0]);
    } catch (e) {
      validationErrors.name = e;
    }

    try {
      validatedEmail = validateEmail(fieldsArr[1]);
    } catch (e) {
      validationErrors.email = e;
    }

    try {
      validatedMessage = validateString(fieldsArr[2]);
    } catch (e) {
      validationErrors.message = e;
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: validationErrors });
    }

    try {
      let userEmail;
      const { portfolioId } = req.params;

      try {
        const getPortfolio = await getPortfolioById(portfolioId);
        const getUser = await getUserById(getPortfolio.ownerId);
        userEmail = getUser.email;

        // Message insertion into DB
        await createMessage(
          portfolioId,
          validatedName,
          validatedEmail,
          validatedMessage
        );
      } catch (e) {
        console.warn(e);
        return res.status(500).json({ error: e });
      }

      await sendEmail(
        userEmail,
        validatedName,
        validatedEmail,
        validatedMessage
      );

      return res.render("success", {
        senderName: validatedName,
        portfolioId: portfolioId,
        delay: 3000,
      });
    } catch (e) {
      console.warn(e);
      return res.status(500).json({ error: e });
    }
  });

export default router;
