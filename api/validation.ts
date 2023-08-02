import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface UserData {
  displayName: string;
  givenName: string;
  mail: string;
  surname: string;
  userPrincipalName: string;
}

interface MSALError {
  error: { code: string };
}

export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body?.accessToken) {
    res.status(401).send('User unauthorized');
    return;
  }

  axios('https://graph.microsoft.com/v1.0/me', {
    method: 'get',
    headers: {
      authorization: 'Bearer ' + (req.body.accessToken as string),
    },
  })
  .then(async (data) => {
    const userInfo: UserData = data.data;  

    console.log(userInfo);
    // const val = (await data.json()) as UserData | MSALError;
    // if ((val as MSALError).error?.code === 'InvalidAuthenticationToken') {
    //   res.status(401).send('Invalid Authentication Token');
    //   return;
    // }

    // res.locals.user = val as UserData;
    next();
  })
    .catch(() => {
      res.status(500).send('Error contacting Microsoft');
    });
};
