import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import * as models from './models/index.js';
try {
  await connectDatabase();
  await Promise.all(Object.values(models).map((model) => model.init()));
  const app = createApp();
  const port = Number(process.env.PORT || 4000);
  app.listen(port, '127.0.0.1', () => console.log(`Fais API ready at http://127.0.0.1:${port}`));
} catch {
  console.error(
    'Could not start Fais. Check that MongoDB is running and backend/.env contains a valid MONGODB_URI and SESSION_SECRET.',
  );
  process.exit(1);
}
