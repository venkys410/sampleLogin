const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "samplelelogin.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

app.post("/users/", async (request, response) => {
  const userDetails = request.body;
  const { username, password } = userDetails;
  const hashedPass = await bcrypt(password, 10);
  const userQuery = `SELECT * FROM users WHERE user_name = ${username}`;
  const dbUser = await db.get(userQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
            INSERT INTO users(user_name,password)
            VALUES('${username}','${hashedPass}');
        `;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status(400);
    response.send("Username Already Exits");
  }
});

initializeDbAndServer();
