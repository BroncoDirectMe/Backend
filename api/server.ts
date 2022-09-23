import cors from 'cors';
import express from 'express';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/professor', (req, res) => {
  // API returns single professor data or null if doesn't exist
  // I'm using a single object, but Ideally this should be a nested dictionary? this is the format that I'll just stick with 
  const professorReturn = {
    "BroncoDirect Name": "Name",
    "Name" : "Name",
    "RMP" : "Name",
    "RMP Name": "Name",
    "Difficulty": 1,  // 1-10
    "TakeAgain": 4.2  // 1.0- 5.0

  }
  // BroncoDirect Name, RMP Name, RMP URL, Rating, Difficulty, TakeAgain(float)
  
  return res.send(professorReturn|| 'in prof');
});
app.post('/search', (req, res) => {
  // returns random list of professors
  const searchReturn ={
    profs :[1,2,3,4,5,6,7,8,9] // remember this should return actual professor names 
  }

  
  res.send(searchReturn || 'contact peppacaiou');
});


app.listen(process.env.PORT ?? 3000);

// https://reqbin.com/