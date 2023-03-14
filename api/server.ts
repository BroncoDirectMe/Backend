import { getProfessorSearch } from './../scraper/scraper';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { ProfessorPage } from '../scraper/graphql/interface';
import {
  addProf,
  profSearch,
  checkProfName,
  initializeMySQL,
  checkSQLConnection,
} from './sql';

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
      console.log('MySQL server started.');
    } catch (err) {
      console.error('Error starting MySQL server: ', err);
      return res.status(500).send('Error starting MySQL server.');
    }
  }
  next();
};

app.use(checkConnection);

function checkEmpty(content: object, res: any): boolean {
  if (Object.keys(content).length === 0) {
    res.status(400).send({ err: 'empty json not accepted' });
    return true;
  }
  return false;
}

// const cachedProfData: { [key: string]: ProfessorPage | null } = {};

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
    if (Object.keys(result).length === 0) {
      if ((await checkProfName(name)).length > 0) {
        await addProf(name);
        data = await profSearch(name);
        console.log(
          `[SUCCESS] Professor ${name} has been added to the database.`
        );
      } else {
        return res.status(400).send('professor not found in mapping');
      }
    } else {
      // [TODO] Update logic to else if to check for timestamp difference (3mo+ update data)
      data = result;
    }
  } catch (err) {
    console.error(err);
  }
  res.send(data);
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

app.listen(process.env.PORT ?? 3000);
void initializeMySQL();

// https://reqbin.com/
