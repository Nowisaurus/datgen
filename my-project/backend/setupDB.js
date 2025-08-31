require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const {
    DB_HOST,
    DB_PORT = 3306,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
  } = process.env;

  let root;
  try {
    root = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });

    await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await root.query(`USE \`${DB_NAME}\`;`);

    await root.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await root.query(`
      CREATE TABLE IF NOT EXISTS records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fieldName VARCHAR(255) NOT NULL,
        fieldType VARCHAR(100) NOT NULL,
        fieldValue TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database and tables are ready.");
    await root.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ DB setup error:", err?.message || err);
    process.exit(1);
  }
})();
