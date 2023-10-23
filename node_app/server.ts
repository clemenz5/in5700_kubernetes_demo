// src/app.ts
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';


const app = express();
const PORT = 3000;

const requestLogPath = 'request.log';

// Middleware to limit requests to 1 per second
let lastRequestTime = 0;

app.use((req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();

  if (now - lastRequestTime < 1000) {
    process.exit(1);

    //res.status(429).json({ error: 'Too many requests. Try again later.' });
  } else {
    lastRequestTime = now;
    next();
  }
});

// Middleware to log requests to a file
app.use((req: Request, res: Response, next: NextFunction) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;

  fs.appendFile(requestLogPath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to the request log:', err);
    }
  });

  next();
});

// API endpoint
app.get('/*', (req: Request, res: Response) => {
    try {
        res.type('text/plain');
        res.charset = 'utf-8';
        res.send(fs.readFileSync(requestLogPath, 'utf8'));
      } catch (error) {
        console.error('Error reading the file:', error);
      }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
