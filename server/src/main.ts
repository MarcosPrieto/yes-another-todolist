import express from 'express';

// Connect to MongoDB
import { mongoConnect } from './dal/connector';

//Routes
import taskRoutes from './routes/task.routes';

const PORT = process.env['PORT'] || 3001;

const app = express();

app.use(express.json());

app.use('/task', taskRoutes);

mongoConnect(() => {
  console.log('listening to port 3001');
  app.listen(PORT);
});




