import cors from 'cors';
import express from 'express';
import { initializeMySQL } from './sql';

const app = express();
app.use(express.json());
app.use(cors());

function checkEmpty(values: object): boolean {
  return Object.keys(values).length === 0;
}

app.post('/professor', (req, res) => {
  // API returns single professor data or null if doesn't exist
  // I'm using a single object, but Ideally this should be a nested object? this is the format that I'll just stick with
  // object input
  // {"name" : "professor"}
  if (checkEmpty(req.body)) {
    return res.status(400).send('empty json not accepted');
  }
  if (!('name' in req.body)) {
    return res.status(400).send('name of professor needs to be specified');
    
  }

  const professorReturn = {
    broncoDirectName: 'Name',
    name: 'Name',
    rmp: 'Name',
    rmpName: 'Name',
    difficulty: 1, // 1-10
    takeAgain: 4.2, // 1.0- 5.0
  };
  // BroncoDirect Name, RMP Name, RMP URL, Rating, Difficulty, TakeAgain(float)

  return res.send(professorReturn || 'in prof');
});
app.post('/search', (req, res) => {
  // returns random list of professors
  if (checkEmpty(req.body)) {
    return res.status(400).send('please provide a json with key of count');
    
  }
  if (!('count' in req.body)) {
    return res.status(400).send('must specify the amount of professors needed');
    
  } 
  else if (!Number.isInteger(req.body.count)) {
      return res.status(400).send('please specify a number ');

  }


  const searchReturn = {
    profs: [1, 2, 3, 4, 5, 6, 7, 8, 9], // remember this should return actual professor names
  };

  return res.send(searchReturn || 'contact peppacaiou');
});


// app.get('/', (req,res)=>{
//   res.send("get request called")
// })

app.listen(process.env.PORT ?? 3000);
void initializeMySQL();

// https://reqbin.com/
