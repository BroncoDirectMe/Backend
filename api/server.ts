import { getProfessorSearch } from './../scraper/scraper';
import cors from 'cors';
import express from 'express';
import { ProfessorPage } from '../scraper/graphql/interface';
import { getProfessorByName } from '../scraper/scraper';
import { initializeMySQL } from './sql';

const app = express();
app.use(express.json());
app.use(cors());

function checkEmpty(values: object): boolean {
  return Object.keys(values).length === 0;
}

/* eslint-disable @typescript-eslint/naming-convention */
const tempMapping: { [key: string]: string } = {
  'Hao Ji': 'Hao Ji',
  'Ben Steichen': 'Ben Steichen',
  'Thanh Nguyen': 'Thanh Nguyen',
};

const tempData: { [key: string]: ProfessorPage | null } = {};

/* eslint-enable @typescript-eslint/naming-convention */

app.post('/professor', async (req, res) => {
  // API returns single professor data or null if doesn't exist
  // I'm using a single object, but Ideally this should be a nested object? this is the format that I'll just stick with
  // object input
  // {"name" : "professor"}
  if (checkEmpty(req.body)) {
    res.status(400).send('empty json not accepted');
    return;
  }
  if (!('name' in req.body)) {
    res.status(400).send('name of professor needs to be specified');
    return;
  }

  const name: string = req.body.name;
  let data: ProfessorPage | null;

  if (!(name in tempMapping)) {
    res.status(400).send('professor not found in mapping');
    return;
  } else if (!(name in tempData)) {
    // first time scraping professor data
    console.log('ADDED NEW PROFESSOR:', name);
    tempData[name] = await getProfessorByName(tempMapping[name]);
  }

  // eslint-disable-next-line prefer-const
  data = tempData[name];

  if (!data) {
    res.status(400).send('name of professor not in RMP');
    return;
  }

  res.send(data);
});

app.post('/search', async (req, res) => {
  // returns random list of professors
  if (checkEmpty(req.body)) {
    res.status(400).send('please provide a json with key of count');
    return;
  }
  if ('count' in req.body && !Number.isInteger(req.body.count)) {
    res.status(400).send('count parameter must be number');
    return;
  }
  if (!('name' in req.body)) {
    res.status(400).send('name of professor needs to be specified');
    return;
  }

  const data = await getProfessorSearch(req.body.name);

  res.send(data);
});

app.listen(process.env.PORT ?? 3000);
void initializeMySQL();

// https://reqbin.com/
