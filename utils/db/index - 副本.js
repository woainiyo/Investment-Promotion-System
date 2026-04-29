const mysql = require("mysql2");
const db = mysql
  .createPool({
    host: "localhost",
    user: "business",
    password: "123123",
    database: "business",
  })
  .promise();

module.exports = db;
