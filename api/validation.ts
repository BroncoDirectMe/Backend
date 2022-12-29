import { Request, Response, NextFunction } from 'express';

export interface UserData {
  displayName: string;
  givenName: string;
  mail: string;
  surname: string;
  userPrincipalName: string;
}

export interface UserValidatedResponse extends Response {
  locals: {
    user: UserData;
  };
}

interface MSALError {
  error: { code: string };
}

export const validateEmail = (
  req: Request,
  res: UserValidatedResponse,
  next: NextFunction
): void => {
  if (!req?.headers.authorization) {
    res.status(401).send('User unauthorized');
    return;
  }
  fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      authorization: req.headers.authorization,
    },
  })
    .then(async (data) => {
      const val = (await data.json()) as UserData | MSALError;
      if ((val as MSALError).error?.code === 'InvalidAuthenticationToken') {
        res.status(401).send('Invalid Authentication Token');
        return;
      }

      res.locals.user = val as UserData;
      next();
    })
    .catch((e) => {
      res.status(500).send('Error contacting Microsoft');
    });
};
