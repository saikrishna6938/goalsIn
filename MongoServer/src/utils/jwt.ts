import jwt, { SignOptions } from "jsonwebtoken";
import { appConfig } from "../config/env";

export interface TokenPayload {
  userId: number;
  [key: string]: unknown;
}

export const signToken = (
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"]
) => {
  return jwt.sign(payload, appConfig.jwtSecret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, appConfig.jwtSecret) as TokenPayload;
};
