// listUsers.js
import { dbConnection, closeConnection } from "./config/mongoConnection.js";

const main = async () => {
  const db = await dbConnection();
  const users = await db.collection("users").find({}).toArray();
  console.log(
    "Found users:",
    users.map((u) => ({
      _id: u._id.toString(),
      username: u.username,
      email: u.email,
    }))
  );
  await closeConnection();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
