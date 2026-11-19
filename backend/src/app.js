import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import menuRoutes from './routes/menu.Routes.js';
import userRoutes from './routes/user.Routes.js';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';

// Connect to database
connectDB();

// Initialize Express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);

// Serve Frontend
//if (process.env.NODE_ENV === 'production') {
// app.use(express.static(path.join(__dirname, '../../frontend/build')));
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../../frontend/build/index.html'));
// });
//}
// else {
//app.get('*', (req, res) => {
// res.status(404).send('Please set to production');
// });
//}
app.use(errorHandler);

export default app;
