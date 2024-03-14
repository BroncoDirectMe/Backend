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
import * as fs from 'fs';
import * as path from 'path';
import { CourseInfo } from './Course';

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

/**
 * Returns an array of strings representing the available school years, sorted from the most recent to the oldest.
 * This function is useful for determining the range of school years for which data is available.
 * @returns {string[]} An array of school year strings in the format "YYYY-YYYY", representing the available school years.
 */
function availableSchoolYears(): string[] {
  return ['2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];
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

app.get('/majors/:schoolYear', (req, res) => {
  const schoolYear = req.params.schoolYear;
  const filePath = path.join(
    process.cwd(),
    `/parser/parsed/majors_${schoolYear}.json`
  );

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);

      return res.status(404).send('School year not found or data unavailable.');
    }
    const majors = JSON.parse(data);
    res.json(Object.keys(majors));
  });
});

app.post('/majors', (req, res) => {
  if (checkEmpty(req.body, res)) {
    return;
  }
  let { schoolYear, majorName } = req.body;

  if (schoolYear && !availableSchoolYears().includes(schoolYear)) {
    return res.status(404).send('Invalid school year.');
  }

  if (!schoolYear) {
    schoolYear = availableSchoolYears()[0] ?? '2023-2024';
  }

  const filePath = path.join(
    process.cwd(),
    `/parser/parsed/majors_${String(schoolYear)}.json`
  );

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(404).send('Data not found.');
    }
    const majors = JSON.parse(data);
    const majorDetails = majors[majorName];
    if (majorDetails) {
      res.json(majorDetails);
    } else {
      res.status(404).send('Major not found.');
    }
  });
});

app.get('/courses/:schoolYear', async (req, res) => {
  const { schoolYear } = req.params;

  if (
    !schoolYear ||
    (schoolYear && !availableSchoolYears().includes(schoolYear))
  ) {
    return res.status(404).send('Invalid school year.');
  }

  const filePath = path.join(
    process.cwd(),
    `/parser/parsed/courses_${schoolYear}.json`
  );

  try {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(404).send('Data not found.');
      }
      const courses = JSON.parse(data);
      const courseList = Object.entries<CourseInfo>(courses).map(
        ([id, course]) => ({ id, name: course.name })
      );
      return res.json(courseList);
    });
  } catch (err) {
    console.error(err);
    return res
      .status(404)
      .send('Courses data for the specified school year not found.');
  }
});

app.post('/courses', async (req, res) => {
  if (checkEmpty(req.body, res)) {
    return;
  }
  let { schoolYear, courseId } = req.body;

  if (schoolYear && !availableSchoolYears().includes(schoolYear)) {
    return res.status(404).send('Invalid school year.');
  }

  if (!schoolYear) {
    schoolYear = availableSchoolYears()[0] ?? '2023-2024';
  }

  const filePath = path.join(
    process.cwd(),
    `/parser/parsed/courses_${String(schoolYear)}.json`
  );

  try {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(404).send('Course not found.');
      }
      const courses = JSON.parse(data);
      const course = courses[courseId];
      if (!course) {
        return res.status(404).send('Course not found.');
      }
      res.json(course);
    });
  } catch (err) {
    console.error(err);
    res
      .status(404)
      .send('Courses data for the specified school year not found.');
  }
});

app.listen(process.env.PORT ?? 3000);
void initializeMySQL();

// https://reqbin.com/
