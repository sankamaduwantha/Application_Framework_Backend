import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import connectDB from './Config/db.js';
import mainRouter from './Routes/index.js';
import authRouter from './Routes/authRouter.js';
import { errorHandler } from './Middleware/errorHandler.js';

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', mainRouter);
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AF Backend API' });
});

// Error Handler
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
