import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface UserData {
  displayName: string;
  givenName: string;
  mail: string;
  surname: string;
  userPrincipalName: string;
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

      res.locals.user = userInfo;
      next();
    })
    .catch(() => {
      res.status(500).send('Error contacting Microsoft');
    });
};
