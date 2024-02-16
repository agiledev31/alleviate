const cron = require('node-cron');
const dotenv = require("dotenv");
dotenv.config();
const { connectDB } = require("../config/db");

connectDB().then(() => {
  const emailCron = require('./allCron')

  // Email Crons
  cron.schedule('0 0 * * *', () => {
    emailCron.runJob();
  });

})

console.log('CRON STARTED');
