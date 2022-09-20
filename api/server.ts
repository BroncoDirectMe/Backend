import cors from 'cors';
import express from 'express';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/', (req, res) => {
  // algorithm for random list
  let teachers = ["here", "are","some","shit"]
  //algorithm end 
  
  res.send(req.body.test || 'Hello World');
});

app.post('/', (req, res) => {
  // algorithm for random list
  let teachers = ["here", "are","some","shit"]
  //algorithm end 
  
  res.send(req.body.test || 'Hello World');
});

app.listen(process.env.PORT ?? 3000);

//https://reqbin.com/