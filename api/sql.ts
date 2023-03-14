import { createConnection } from 'mysql2';
import { Professor } from './Professor';
import { readFile } from '../scraper/professors/populate';
import 'dotenv/config';

let connection: any;

/**
 * Internal use function to execute a single SQL command as prepared statements with error catching.
 * @param {string} SQLCommand Single quotation marks for one-line commands. Template string for multi-line commands.
 * @param {string[]} [placeholder] Optional parameter used for SQL commands that require function parameters
 */
async function execute(cmd: string, placeholder?: string[]): Promise<any> {
  const data = await new Promise((resolve) =>
    connection.execute(cmd, placeholder, (err: any, result: any) => {
      if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(
          'Error: Please check that the .env file exists, matches the template in .env-template, and is in the same relative file location as .env-template'
        );
        process.kill(process.pid, 'SIGTERM');
      } else if (err) {
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
 * @return {Promise<void>} Array of JSON values.
 * Value can be extracted by awaiting function call within an async function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function profSearch(broncoDirectName: string): Promise<void> {
  const result = await execute(
    'SELECT * FROM `rateMyProfessorDB` WHERE `broncoDirectName` = ?',
    [broncoDirectName]
  );
  return result;
}

/**
 * Adds a professor to the profDB table in SQL database
 * @param {string} broncoDirectName name to be added
 */
export function addProfName(broncoDirectName: string): void {
  void execute('INSERT INTO professorDB (broncoDirectName) VALUES (?)', [
    broncoDirectName,
  ]);
}

/**
 * Checks if a professor exists in the database (meaning they are a valid professor)
 * @param {string} broncoDirectName name to be checked
 * @return {Promise<object[]>} Array of JSON values
 */
export async function checkProfName(
  broncoDirectName: string
): Promise<object[]> {
  const result = await execute(
    'SELECT * FROM `professorDB` WHERE `broncoDirectName` = ?',
    [broncoDirectName]
  );
  return result;
}

/**
 * Updates existing professor in the SQL database
 * @param {Professor} newProfessor See professor interface (/api/Professor.d.ts)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// used to populate professorDB if doesn't already exist
async function checkDatabaseExist(): Promise<boolean> {
  const result = await execute(`SELECT COUNT(*) FROM professorDB`);
  const resultAmount = Object.values(result[0])[0] as number;
  return resultAmount > 0;
}

// checks if there is an active SQL connection
export async function checkSQLConnection(): Promise<boolean> {
  // makes sure connection has a ping command
  if (!connection?.ping) {
    return false;
  }

  try {
    connection.ping();
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Initializes mySQL in the backend by creating a connection to the mySQL server. See comments within the function for download instructions on mySQL by ctrl (windows) / option (mac) clicking the function name.
 */
export async function initializeMySQL(): Promise<void> {
  // Initializing mySQL requires a local mySQL server download from https://dev.mysql.com/doc/refman/8.0/en/installing.html.
  // Download based on the OS you have and select the recommended developer bundle in the executable.
  // IMPORTANT NOTE: InnoDB is not required to run mySQL. Simply click next until you can create a username and password.
  // When running locally, .env should have the following variables:
  // SQL_PORT=3306
  // HOST=localhost
  // DB_USER='user that you created'
  // PASSWORD='password that you created'
  // When initializing, there is an option to start the mySQL server instance when your PC starts.
  // If left unchecked, the mySQL server can be started by opening 'mySQL Installer - Community' and selecting the option to reconfigure the mySQL Server.
  // User and password necessary for mySQL operations and connections are also initialized through the mySQL server setup.
  // Create a .env file using .env-template as a template to create mySQL connection.

  const mySQLConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database?: string;
  } = {
    host: process.env.HOST ?? 'localhost',
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306,
    user: process.env.DB_USER ?? 'user',
    password: process.env.PASSWORD ?? 'password',
    database: 'broncoDirectMeDB',
  };

  connection = createConnection(mySQLConfig);
  connection.connect((err: Error) => {
    if (err) {
      delete mySQLConfig.database;
      connection = createConnection(mySQLConfig);
      void execute('CREATE DATABASE IF NOT EXISTS `broncoDirectMeDB`');
      console.log(
        "Database created. Rerun the code to use the mySQL functions. NOTE: The current nodemon process must be killed with ctrl+c (windows) or cmd+c (mac) and restarted completely by running 'npm run api'."
      );
      // mySQL looks for a database on connection.
      // New installations of mySQL don't have a database created, so it's created here to prevent errors when running mySQL commands
    }
  });

  if (!(await checkDatabaseExist())) {
    await readFile().then((result) => result.map((val) => addProfName(val)));
  } else {
    console.log('professorDB is already populated.');
  }

  void execute(`
    CREATE TABLE IF NOT EXISTS rateMyProfessorDB (
      profID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
      profName varchar(255),
      firstName varchar(255),
      lastName varchar(255),
      avgDifficulty float(2, 1),
      avgRating float(2, 1),
      numRatings int,
      wouldTakeAgainPercent float(7, 4),
      timeAdded timestamp DEFAULT CURRENT_TIMESTAMP,
      id varchar(255),
      legacyId int
    )
  `);

  void execute(`CREATE TABLE IF NOT EXISTS professorDB (
    profID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    broncoDirectName varchar(255)
  )`);
  void execute(`CREATE TABLE IF NOT EXISTS votesDB (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userID int,
    voteType boolean
  )`);
  void execute(`
  CREATE TABLE IF NOT EXISTS usersDB (
    userID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userEmail varchar(255)
  )`);

  // const sampleProf: Professor = {
  //   broncoDirectName: 'Poppy Gloria',
  //   rmpName: 'Poppy Gloria',
  //   rmpURL: 'ratemyprofessor.com/PoppyGloria',
  //   profRating: 10.0,
  //   profDifficulty: 2.1,
  //   takeClassAgain: 1.0,
  // };

  // console.log('yeet');
  // addProf(sampleProf);
  // const result = await profSearch('Poppy Gloria');
  // console.log(result);
}
