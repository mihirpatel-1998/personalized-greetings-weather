require('dotenv').config();
const app = require('./app');
const { connectMongo } = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
  });
})();
