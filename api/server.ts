import { validateEmail } from './validation';
import { getProfessorSearch } from './../scraper/scraper';
import cors from 'cors';

import express from 'express';
import { ProfessorPage } from '../scraper/graphql/interface';
import { getProfessorByName } from '../scraper/scraper';
import { initializeMySQL,createUserID, getUserID, addVote, getProf} from './sql';
import { create } from 'ts-node';

import {sign,verify,JwtPayload} from 'jsonwebtoken'
import {readFileSync} from 'fs'

const app = express();
app.use(express.json());
app.use(cors());
interface User{
  userID: number,
  email: string
}
interface RawUserVote{
  userID: number,
  professorName: string,
  token: string
}
function checkEmpty(content: User, res: any): boolean {
  if (Object.keys(content).length === 0) {
    res.status(400).send({ err: 'empty json not accepted' });
    return true;
  }
  return false;
}

function encrypt(id:any[]):string{
  
  // return "test"
  const key:string = process.env.TOKEN_HASH as string
  // const key = "test"
  const token:string = sign(id, key)
  console.log(token)
  return token
  


}// make sure to debug these two functions

function decrypt(token:string):string|JwtPayload{
  const key:string = process.env.TOKEN_HASH as string
  const id = verify(token,key)
  return id

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

  }

  const name: string = req.body.name;
  let data: ProfessorPage | null;

  // RMP name provided
  if ('exact' in req.body) {
    data = await getProfessorByName(name);
  } else {
    if (!(name in tempMapping)) {
      return res.status(400).send('professor not found in mapping');
    }
    data = await getProfessorByName(tempMapping[name]);
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



app.post('/vote', (req, res) => { // debug this
  // needs to have a vote, encrypted userID and professor name

  
  if (checkEmpty(req.body, res)) {
    return;
  }
  if (!('professor' in req.body)) {
    return res.status(400).send('Professor key is missing')
  }
  if(!('vote' in req.body)){
    return res.status(400).send('Vote key is missing')
  }
  if(!('token' in req.body)){
    return res.status(400).send('token key is missing')
  }
  const profID = getProf(req.body.professor)
  const token = req.body.token
  const userInfo = decrypt(token) as User
  console.log(userInfo)

  
  // check if vote exists, if not create a new one, else if they are equal delete
  
  return res.status(400).send({profID});
});

app.post('/login', validateEmail, async (req, res) => {
  const email:string = res.locals.user.mail
  await createUserID(email)
  const userID=await getUserID(email)
  
  const encryptedVal = encrypt(userID[0])
  // console.log(req.body)
  res.send({token:encryptedVal})
});
// app.post('/create', async (req,res)=>{
  
// })
app.get('/test_signup', async (req,res)=>{
  
})
// app.get('get_database',async (req,res)=>{
// })
app.listen(process.env.PORT ?? 3000);
void initializeMySQL();


// https://reqbin.com/

// app.post('/upvote', async (req, res) => {
//   const SEND_DATA: { [key: string]: number } = {};
//   if (checkEmpty(req.body, res)) {
//     return;
//   }
//   if (!('professor' in req.body)) {
//     return res.status(400).send('Professor key is missing');
//   }
//   try {
//     req.body.professor.forEach((item: string) => {
//       SEND_DATA[item] = 1;
//     });
//     res.send(SEND_DATA);
//   } catch (error: unknown) {
//     const ERROR_MESSAGE = error;
//     res.send(ERROR_MESSAGE);
//   }
// });

// app.post('/downvote', async (req, res) => {
//   const SEND_DATA: { [key: string]: number } = {};
//   if (checkEmpty(req.body, res)) {
//     return;
//   }
//   if (!('professor' in req.body)) {
//     return res.status(400).send('Professor key is missing');
//   }
  
//   try {
//     req.body.professor.forEach((item: string) => {
//       SEND_DATA[item] = 0;
//     });
//     res.send(SEND_DATA);
//   } catch (error: unknown) {
//     const ERROR_MESSAGE = error;
//     res.send(ERROR_MESSAGE);
//   }
// });
