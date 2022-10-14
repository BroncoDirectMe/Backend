import mysql from 'mysql2';
import { Professor } from './Professor';
import 'dotenv/config';

let connection: any;

/**
 * Internal use function to execute SQL commands as prepared statements with error catching.
 * @param {string} SQLCommand Single quotation marks for one-line commands. Template string for multi-line commands.
 * @param {string[]} [placeholder] Optional parameter used for SQL commands that require function parameters
 */
async function execute(cmd: string, placeholder?: string[]): Promise<any> {
  const data = await new Promise((resolve) =>
    connection.execute(cmd, placeholder, (err: any, result: any) => {
      if (err) {
        console.log(err);
        process.kill(process.pid, 'SIGTERM');
      }
      resolve(result);
    })
  );
  return data;
}

/**
 * Finds a professor in the SQL Database given their BroncoDirect name.
 * @param {string}  broncoDirectName BroncoDirect name
 * @returns {Promise<void>} Array of JSON values.
 * Value can be extracted by awaiting function call within an async function
 */
async function profSearch(broncoDirectName: string): Promise<void> {
  const result = await execute(
    'SELECT * FROM `professorDB` WHERE `broncoDirectName` = ?',
    [broncoDirectName]
  );
  return result;
}

/**
 * Adds a professor to the SQL database
 * @param {Professor} professor See professor interface (/api/Professor.d.ts)
 */
function addProf({
  broncoDirectName,
  rmpName,
  rmpURL,
  profRating,
  profDifficulty,
  takeClassAgain,
}: Professor): void {
  void execute('INSERT INTO professorDB VALUES (?, ?, ?, ?, ?, ?)', [
    broncoDirectName,
    rmpName,
    rmpURL,
    profRating.toFixed(2),
    profDifficulty.toFixed(2),
    takeClassAgain.toFixed(2),
  ]);
}

/**
 * Updates existing professor in the SQL database
 * @param {Professor} newProfessor See professor interface (/api/Professor.d.ts)
 */
async function updateProf({
  broncoDirectName,
  rmpName,
  rmpURL,
  profRating,
  profDifficulty,
  takeClassAgain,
}: Professor): Promise<void> {
  void execute(
    `UPDATE professorDB SET 
  rmpName = ?,
  rmpURL = ?,
  profRating = ?,
  profDifficulty = ?,
  takeClassAgain = ?
  WHERE broncoDirectName = ?`,
    [
      rmpName,
      rmpURL,
      profRating.toFixed(2),
      profDifficulty.toFixed(2),
      takeClassAgain.toFixed(2),
      broncoDirectName,
    ]
  );
}

/**
 * Initializes mySQL in the backend by creating a connection to the mySQL server
 */
export async function initializeMySQL(): Promise<void> {
  connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: 'broncoDirectMeDB',
  });
  // Initializing mySQL requires a local mySQL server download from https://dev.mysql.com/doc/refman/8.0/en/installing.html.
  // Download based on the OS you have. When initializing the server, download defaults are set to the port 3306 with host 'localhost'.
  // When initializing, there is an option to start the mySQL server instance when your PC starts.
  // If unchecked, the mySQL server can be started by opening mySQL Installer - Community and selecting the option to reconfigure the mySQL Server.
  // User and password necessary for mySQL operations and connections are also initialized through the mySQL server setup.
  // Create a .env file using .env-template as a template to create mySQL connection.

  void execute('CREATE DATABASE IF NOT EXISTS `broncoDirectMeDB`');
  void execute(`
    CREATE TABLE IF NOT EXISTS professorDB (
      broncoDirectName varchar(255) NOT NULL PRIMARY KEY,
      rmpName varchar(255),
      rmpURL LONGTEXT,
      profRating varchar(255),
      profDifficulty varchar(255),
      takeClassAgain varchar(255)
    )
  `);
  

  // Testing commands:
  // const sampleProf: Professor = {
  //   broncoDirectName: "Poppy Gloria",
  //   rmpName: "Poppy Gloria",
  //   rmpURL: "ratemyprofessor.com/PoppyGloria",
  //   profRating: 10.0,
  //   profDifficulty: 2.1,
  //   takeClassAgain: 1.0
  // }

  // addProf(sampleProf)
  // const result = await profSearch("Poppy Gloria")
  // console.log(result)

  // void updateProf({
  //   broncoDirectName: "Poppy Gloria",
  //   rmpName: "Poppy",
  //   rmpURL: "ratemyprofessor.com/PoppyGloria",
  //   profRating: 10.0,
  //   profDifficulty: 5.0,
  //   takeClassAgain: 1.0
  // })
  // const updatedResult = await profSearch("Poppy Gloria")
  // console.log(updatedResult)
}
