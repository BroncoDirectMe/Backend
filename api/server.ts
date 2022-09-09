import cors from 'cors';
import express from 'express';
import mysql from 'mysql2';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/', (req, res) => {
  res.send(req.body.test || 'Hello World');
});

app.listen(process.env.PORT ?? 3000);

const connection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: "broncoDirectMeDB"
});
// Initializing mySQL requires a local mySQL server download from https://dev.mysql.com/doc/refman/8.0/en/installing.html. 
// Download based on the OS you have. When initializing the server, download defaults are set to the port 3306 with host 'localhost'. 
// User and password necessary for mySQL operations and connections are also initialized through the mySQL server setup. 
// Create a .env file using .env-template as a template to create mySQL connection.

function execute(cmd: string, placeholder?: string[], needResult = false): any {
  connection.execute(cmd, placeholder, (err, result) => {
    if (err) {
      console.log(err)
      process.kill(process.pid, 'SIGTERM');
      // Sigterm error causes node process (nodemon when local testing) to exit with an error and crash. 
      // Prevents any additional code segments after code segment with error from running
    }
    
    if (needResult) {
      return result
    }
  })
}
// Overrides existing execute function to add

execute('CREATE DATABASE IF NOT EXISTS `broncoDirectMeDB`')
execute(`
  CREATE TABLE IF NOT EXISTS professorDB (
    broncoDirectName varchar(255) NOT NULL PRIMARY KEY,
    RMPName varchar(255),
    RMPURL LONGTEXT,
    profRating varchar(255),
    profDifficulty varchar(255),
    takeClassAgain varchar(255)
  )
`)
// Initializes SQL database with defined schema

// function profSearch(broncoDirectName: string): any {
//   execute('SELECT * FROM `table` WHERE `broncoDirectName` = ?', [broncoDirectName], true)
// }