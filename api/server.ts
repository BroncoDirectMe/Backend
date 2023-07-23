import { validateEmail } from './validation';
import { getProfessorSearch } from './../scraper/scraper';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { ProfessorPage } from '../scraper/graphql/interface';
import { getProfessorByName } from '../scraper/scraper';
import {
  addProf,
  updateProf,
  profSearch,
  checkExpiredProfData,
  checkProfName,
  getProfNames,
  initializeMySQL,
  checkSQLConnection,
} from './sql';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors());

// Middleware function to check if the connection to the MySQL server is up
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const checkConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(await checkSQLConnection())) {
    console.log('MySQL server not connected. Starting server...');
    try {
      await initializeMySQL();
    } catch (err) {
      console.error('Error starting MySQL server: ', err);
      return res.status(500).send('Error starting MySQL server.');
    }
  }
  next();
};

app.use(checkConnection);

/**
 * Checks if the request body is empty. If it is, sends a 400 error response.
 * @param content Request body object
 * @param res Response object to send error response
 * @returns Boolean indicating if the request body is empty
 */
function checkEmpty(content: object, res: any): boolean {
  if (Object.keys(content).length === 0) {
    res.status(400).send({ err: 'empty json not accepted' });
    return true;
  }
  return false;
}

/* eslint-enable @typescript-eslint/naming-convention */
app.post('/professor', async (req, res) => {
  // API returns single professor data or null if doesn't exist
  // I'm using a single object, but Ideally this should be a nested object? this is the format that I'll just stick with
  // object input
  // {"name" : "professor"}
  if (checkEmpty(req.body, res)) {
    return;
  }
  if (!('name' in req.body)) {
    return res
      .status(400)
      .send({ err: 'name of professor needs to be specified' });
  }

  const name: string = req.body.name.toLowerCase();
  let data: ProfessorPage | null = null;

  // RMP name provided
  try {
    // Check if prof data already exists
    const result = await profSearch(name);
    if (!result || Object.keys(result).length === 0) {
      /* No data found in db based on 'name' */
      // Check if prof name actually exists in cpp
      if ((await checkProfName(name)).length > 0) {
        await addProf(name);
        data = await profSearch(name); // re-query data after adding info
      } else {
        return res.status(400).send('professor not found in mapping');
      }
    } else if (await checkExpiredProfData(name)) {
      /* Data exists, but it's 3mo+ old */
      const newData = await getProfessorByName(name);
      await updateProf({
        profName: name,
        avgDifficulty: newData?.avgDifficulty ?? -1,
        avgRating: newData?.avgRating ?? -1,
        numRatings: newData?.numRatings ?? -1,
        wouldTakeAgainPercent: newData?.wouldTakeAgainPercent ?? -1,
      });
      data = await profSearch(name); // re-query data after updating info
    } else {
      /* Data exists and is younger than 3mo */
      data = result;
    }
  } catch (err) {
    console.error(err);
  }
  res.send(data);
});

// returns all rmp registered professor names
app.get('/professor/names', async (req, res) => {
  try {
    const data = await getProfNames();
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

app.post('/search', async (req, res) => {
  // returns random list of professors
  if (checkEmpty(req.body, res)) {
    return;
  }
  if ('count' in req.body && !Number.isInteger(req.body.count)) {
    return res.status(400).send('count parameter must be number');
  }
  if (!('name' in req.body)) {
    return res.status(400).send('name of professor needs to be specified');
  }

  const data = await getProfessorSearch(req.body.name);

  res.send(data);
});

app.post('/upvote', async (req, res) => {
  const SEND_DATA: { [key: string]: number } = {};
  if (checkEmpty(req.body, res)) {
    return;
  }
  if (!('professor' in req.body)) {
    return res.status(400).send('Professor key is missing');
  }
  try {
    req.body.professor.forEach((item: string) => {
      SEND_DATA[item] = 1;
    });
    res.send(SEND_DATA);
  } catch (error: unknown) {
    const ERROR_MESSAGE = error;
    res.send(ERROR_MESSAGE);
  }
});

app.post('/downvote', async (req, res) => {
  const SEND_DATA: { [key: string]: number } = {};
  if (checkEmpty(req.body, res)) {
    return;
  }
  if (!('professor' in req.body)) {
    return res.status(400).send('Professor key is missing');
  }
  try {
    req.body.professor.forEach((item: string) => {
      SEND_DATA[item] = 0;
    });
    res.send(SEND_DATA);
  } catch (error: unknown) {
    const ERROR_MESSAGE = error;
    res.send(ERROR_MESSAGE);
  }
});

app.get('/vote', (req, res) => {
  if (checkEmpty(req.body, res)) {
    return;
  }

  const result = {
    profName: 40,
  };
  return res.status(400).send(result);
});

app.get('/checkAuthentication', validateEmail, (req, res) => {
  res.status(200).send(res.locals.user);
});

app.get('/login', async (req, res) => {
  const saltRounds = 10;
  const myPlaintextPassword = 's0//P4$$w0rD';
  const someOtherPlaintextPassword = 'not_bacon';

  let storeHash = '';

  await bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
    if (err) return console.log(err);

    // Store hash in your password DB.
    storeHash = hash;

    // Load hash from your password DB.
    bcrypt.compare(myPlaintextPassword, storeHash, function (err, result) {
      if (err) return console.log(err);
      console.log(`good result: ${result}`);
      // result == true
    });

    bcrypt.compare(
      someOtherPlaintextPassword,
      storeHash,
      function (err, result) {
        if (err) return console.log(err);
        console.log(`bad result: ${result}`);

        // result == false
      }
    );
  });

  return res.send('login poggers');
});

app.listen(process.env.PORT ?? 3000);
void initializeMySQL();

// https://reqbin.com/
