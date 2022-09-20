import cors from 'cors';
import express from 'express';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/professor', (req, res) => {
  // API returns single professor data or null if doesn't exist
  
  
  res.send(req.body.test || 'in prof');
});
app.post('/search', (req, res) => {
  // returns random list of professors

  
  res.send(req.body.test || 'in search');
});


app.listen(process.env.PORT ?? 3000);

//https://reqbin.com/