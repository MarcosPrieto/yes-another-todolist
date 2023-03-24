import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Models
import { User } from '../models/user.model';

// Queries
import * as authQueries from '../dal/queries/auth.query';
import { createToken } from '../services/token.service';


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const loggedInUser = await authQueries.getUserByEmail(email);

  if (!loggedInUser) {
    return res.status(401).send('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, loggedInUser?.password);

  if (passwordMatch) {
    return res.status(200).send({ ...loggedInUser, token: createToken(loggedInUser) });
  }

  return res.status(401).send('Invalid credentials');
}

export const signIn = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const id = crypto.randomUUID();
  const creationDate = new Date().toISOString() 

  const hasSignedIn = await authQueries.signin(id, email, hashedPassword, name, creationDate);

  if (!hasSignedIn) {
    return res.status(409).send('User already exists');
  }

  return res.status(201).send({id, email, name, token: createToken({id, email} as User)});
}