import cors from 'cors';
import express from 'express';
import { initializeMySQL } from './sql';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/', (req, res) => {
  res.send(req.body.test || 'Hello World');
});

app.listen(process.env.PORT ?? 3000);
initializeMySQL()