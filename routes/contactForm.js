import { Router } from "express";
import { ObjectId } from "mongodb";
import { messages, users } from "../config/mongoCollections.js";
import { closeConnection } from "../config/mongoConnection.js";
import { validateString, validateEmail } from "../helpers.js";

const router = Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      res.render("contact-form", { pageTitle: "Contact Form" });
    } catch (e) {
      return res.sendStatus(500);
    }
  })
  .post(async (req, res) => {
    const reqURL = req.url;
    const name = req.body.senderName;
    const email = req.body.emailRecipient;
    const message = req.body.message;
    console.table({ reqURL, name, email, message });
    let validatedName;
    let validatedEmail;
    let validatedMessage;

    try {
      // STATUS: validating the 3 fields of the form
      try {
        validatedName = validateString(name);
      } catch (e) {
        console.warn("ATTEMPTING TO VALIDATE NAME FIELD...");
        console.log(e.message);
        return res.sendStatus(500);
      }

      try {
        validatedEmail = validateEmail(email);
      } catch (e) {
        console.warn("ATTEMPTING TO VALIDATE EMAIL FIELD...");
        console.log(e.message);
        return res.sendStatus(500);
      }

      try {
        // TODO: add xss replace script you have here
        validatedMessage = validateString(message);
      } catch (e) {
        console.warn("ATTEMPTING TO VALIDATE MESSAGE FIELD...");
        console.log(e.message);
        return res.sendStatus(500);
      }

      // TODO: 2 things must happen:  1) store contact-form contents in messages collection 2) send message to recipient
      try {
        try {
          // STATUS: 1) store contact-form contents in messages collection
          // STATUS: vars to info:
          // validatedName
          // validatedEmail
          // validatedMessage
          // STATUS: fields in messages collection:
          // _id
          // portfolioId - new ObjectId instance with portfolio._id
          // senderName - validatedName
          // senderEmail - validatedEmail
          // message - validatedMessage
          // sentAt - ISODate

          // TODO: need to query db for recipientEmail to get their id thus we associate user with message for them
          const usersCollection = await users();
          const findUser = await usersCollection.find({ email: validateEmail });
          console.table("USER Query", findUser);
          // STATUS: so below should be the proposed messages collection schema
          const newMessageDoc = {
            recipientId: new ObjectId(findUser._id),
            senderName: validatedName,
            message: validatedMessage,
          };
          const messagesCollection = await messages();
          const insertOp = await messagesCollection.insertOne(newMessageDoc);

          if (!insertOp.insertedId) {
            throw new Error("Error: Unable to add message to db.");
          } else {
            console.log(
              "SUCCESSFULLY ADDED MESSAGE TO COLLECTION WITH ID: ",
              insertOp.insertedId
            );
          }
        } catch (e) {
          console.warn(e.message);
          return res.status(500).json({ error: e.message });
        }
        // STATUS: 2) sending message to recipient - the main work of this try...catch block
        // TODO: implement nodemailer
      } catch (e) {
        console.warn(e.message);
        return res.status(500).json({ error: e.message });
      }
      // TODO: render a success page and then redirect them to previous page - which should be portfolio they came from
      return res.render("success", { redirectUrl: reqURL, delay: 3000 });
    } catch (e) {
      console.error(e.message);
      return res.status(500).json({ error: e.message });
    } finally {
      // TODO: close connection to db
      console.log("CLOSING DB CONNECTION ");
      await closeConnection();
    }
  });

export default router;
