import 'reflect-metadata';
import express from 'express';
import { container } from 'tsyringe';
import cors from 'cors';
import bearerToken from 'express-bearer-token';

import CityController from './controllers/CityController';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// === Middleware for parsing JSON ===
app.use(express.json());

// === Cors Middleware ===
app.use(cors());

// === Bearer Token Middleware ===
app.use(bearerToken({
	headerKey: "bearer"
}));

// === Controllers ===
const cityController = container.resolve(CityController); // Lightweight dependency injection container maintained by Microsoft
app.use('/', cityController.routes());

// === HTTP Server ===
const PORT = parseInt(process.env.APP_PORT!);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at ${process.env.APP_HOST}:${PORT}`);
});