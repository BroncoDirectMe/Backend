import { getProfessorSearch } from './../scraper/scraper';
import cors from 'cors';
import express from 'express';
import { ProfessorPage } from '../scraper/graphql/interface';
import { getProfessorByName } from '../scraper/scraper';
import { initializeMySQL, checkProfName } from './sql';

const app = express();
app.use(express.json());
app.use(cors());

function checkEmpty(content: object, res: any): boolean {
  if (Object.keys(content).length === 0) {
    res.status(400).send({ err: 'empty json not accepted' });
    return true;
  }
  return false;
}

/* eslint-disable @typescript-eslint/naming-convention */
const tempMapping: { [key: string]: string } = {
  'Hao Ji': 'Hao Ji',
  'Ben Steichen': 'Ben Steichen',
};
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

  const name: string = req.body.name;
  let data: ProfessorPage | null;

  // RMP name provided
  const result = await checkProfName(name); // row data of mysql, will return the name if exists
  if (result.length > 0) {
    data = await getProfessorByName(name);
  } else {
    return res.status(400).send('professor not found in mapping');
  }

  if (!data) {
    res.status(400).send('name of professor not in RMP');
    return;
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
