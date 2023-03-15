import { createConnection } from 'mysql2';
import { Professor, ProfessorUpdate } from './Professor';
import { getProfessorByName, getAllProfessor } from '../scraper/scraper';
import 'dotenv/config';

let connection: any;

/**
 * Internal use function to execute a single SQL command as prepared statements with error catching.
 * @param {string} SQLCommand Single quotation marks for one-line commands. Template string for multi-line commands.
 * @param {string[]} [placeholder] Optional parameter used for SQL commands that require function parameters.
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

/* --- rateMyProfessorDB FUNCTIONS --- */

/**
 * Adds a new professor entry into `rateMyProfessorDB` using a professor's full name.
 * @param {Professor} newProfessor See professor interface (/api/Professor.d.ts).
 */
export async function addProf(broncoDirectName: string): Promise<void> {
  try {
    const data = await getProfessorByName(broncoDirectName.toLowerCase());
    if (data && Object.keys(data).length > 0) {
      await addProfGraphQL({
        profName: broncoDirectName.toLowerCase(),
        firstName: data?.firstName,
        lastName: data?.lastName,
        avgDifficulty: data?.avgDifficulty,
        avgRating: data?.avgRating,
        numRatings: data?.numRatings,
        wouldTakeAgainPercent: data?.wouldTakeAgainPercent,
        id: data?.id,
        legacyId: data?.legacyId,
      });
    } else {
      console.error(
        `Professor ${broncoDirectName} not found in GraphQL query.`
      );
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Private function - use `addProf(broncoDirectName)` to query data.
 *
 * Adds a new professor entry into `rateMyProfessorDB` using data from GraphQL.
 * @param {Professor} newProfessor See professor interface (/api/Professor.d.ts).
 */
async function addProfGraphQL({
  profName,
  firstName,
  lastName,
  avgDifficulty,
  avgRating,
  numRatings,
  wouldTakeAgainPercent,
  id,
  legacyId,
}: Professor): Promise<void> {
  try {
    // Check if data already exists in db
    const result = await profSearch(profName);
    if (!result || Object.keys(result).length === 0) {
      void execute(
        `INSERT INTO rateMyProfessorDB (
        profName, 
        firstName, 
        lastName, 
        avgDifficulty, 
        avgRating, 
        numRatings, 
        wouldTakeAgainPercent,
        id,
        legacyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profName.toLowerCase(),
          firstName,
          lastName,
          avgDifficulty.toFixed(1),
          avgRating.toFixed(1),
          numRatings.toString(),
          wouldTakeAgainPercent.toFixed(2),
          id,
          legacyId.toString(),
        ]
      );
    } else {
      console.error(`Professor ${profName} already exists in the database.`);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Updates existing professor data in the SQL database.
 * @param {Professor} newProfessor See professor interface (/api/Professor.d.ts).
 */
export async function updateProf({
  profName,
  avgDifficulty,
  avgRating,
  numRatings,
  wouldTakeAgainPercent,
}: ProfessorUpdate): Promise<void> {
  try {
    void execute(
      `UPDATE rateMyProfessorDB SET
              avgDifficulty = ?,
              avgRating = ?,
              numRatings = ?,
              wouldTakeAgainPercent = ?,
              timeAdded = CURRENT_TIMESTAMP
              WHERE profName = ?`,
      [
        avgDifficulty.toFixed(1),
        avgRating.toFixed(1),
        numRatings.toString(),
        wouldTakeAgainPercent.toFixed(2),
        profName,
      ]
    );
  } catch (err) {
    console.error(err);
  }
}

/**
 * Checks if a professor's data in the db is more than 3 months old.
 * Current expiration date is 3 months, or 7884000 seconds.
 *
 * @param {string}  broncoDirectName BroncoDirect name.
 * @return {Promise<boolean>} True if prof data is 3mo+ old, false otherwise.
 */
export async function checkExpiredProfData(
  broncoDirectName: string
): Promise<boolean> {
  const name = broncoDirectName.toLowerCase();
  const result = await execute(
    'SELECT * FROM `rateMyProfessorDB` WHERE `profName` = ? AND TIMESTAMPDIFF(SECOND, `timeAdded`, NOW()) >= 7884000',
    [name]
  );
  if (Object.keys(result).length === 0) {
    return false;
  }
  return true;
}

/**
 * Finds a professor in the SQL Database given their BroncoDirect name.
 * @param {string}  broncoDirectName BroncoDirect name.
 * @return {Promise<Professor>} JSON of professor data.
 * Value can be extracted by awaiting function call within an async function.
 */
export async function profSearch(broncoDirectName: string): Promise<Professor> {
  const [result] = await execute(
    'SELECT * FROM `rateMyProfessorDB` WHERE `profName` = ?',
    [broncoDirectName]
  );
  result.avgDifficulty = parseFloat(result.avgDifficulty);
  result.avgRating = parseFloat(result.avgRating);
  result.wouldTakeAgainPercent = parseFloat(result.wouldTakeAgainPercent);
  return result;
}

/* --- professorDB FUNCTIONS --- */

/**
 * Adds a professor to the professorDB table in SQL database.
 * @param {string} broncoDirectName name to be added.
 */
export function addProfName(bdFirst: string, bdLast: string): void {
  const fullName = bdFirst + ' ' + bdLast;
  void execute('INSERT INTO professorDB (broncoDirectName) VALUES (?)', [
    fullName,
  ]);
}

/**
 * Checks if a professor's name exists in the `professorDB` database (meaning they are a valid professor).
 * @param {string} broncoDirectName name to be checked.
 * @return {Promise<object[]>} Array of JSON values.
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
 * Checks if `professorDB` already has prof names in it.
 * @return {Promise<boolean>} True if db has data in it, false otherwise.
 */
async function checkProfDatabaseExist(): Promise<boolean> {
  const result = await execute(`SELECT COUNT(*) FROM professorDB`);
  const resultAmount = Object.values(result[0])[0] as number;
  return resultAmount > 0;
}

/* --- MySQL FUNCTIONS --- */

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

  void execute(`
    CREATE TABLE IF NOT EXISTS rateMyProfessorDB (
      profID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
      profName varchar(255),
      firstName varchar(255),
      lastName varchar(255),
      avgDifficulty decimal(2, 1),
      avgRating decimal(2, 1),
      numRatings int,
      wouldTakeAgainPercent decimal(5, 2),
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

  // If professorDB is empty, call graphQL `getAllProfessor` function to get array of all rmp professors (cpp)
  // Professors not currently in RMP may not be included in this scraping
  if (!(await checkProfDatabaseExist())) {
    await getAllProfessor().then((result) =>
      result.forEach((val, index) => {
        addProfName(val.firstName, val.lastName);
        console.log(`Added ${val.firstName + ' ' + val.lastName} - `, index);
      })
    );
  }

  console.log('MySQL server successfully started!');

  // const sampleProf: Professor = {
  //   profName: 'Poppy Gloria',
  //   firstName: 'Poppy',
  //   lastName: 'Gloria',
  //   avgDifficulty: 4.2,
  //   avgRating: 3.4,
  //   numRatings: 12,
  //   wouldTakeAgainPercent: 85.545,
  //   id: 'abc123',
  //   legacyId: 123456,
  // };

  // const sampleProfArray: string[] = [
  //   'Thanh Nguyen',
  //   'Ben Steichen',
  //   'Steven Camacho',
  //   'Li Ge',
  // ];

  // console.log('\n[BRONCODIRECT] Testing Professor Functions.\n-----\n');
  // console.log('[BRONCODIRECT] Add Poppy Gloria to table');
  // await addProfGraphQL(sampleProf);
  // const result = await profSearch('Poppy Gloria');
  // console.log(result);

  // await addProf(sampleProfArray[0]);
  // const result = await profSearch('Thanh Nguyen');
  // console.log(result);
  // const result = await profSearch('Ben Steichen');
  // console.log(result);
}
