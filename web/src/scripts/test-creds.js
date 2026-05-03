const mongoose = require('mongoose');

const uris = [
  'mongodb://[IP_ADDRESS]/mydb_admin:password123!@34.9.202.173:27017/mydb?authSource=admin',
  'mongodb://[IP_ADDRESS]/mydb_admin:password123!@34.9.202.173:27017/mydb?authSource=admin',
];

async function run() {
  for (const uri of uris) {
    try {
      console.log('Trying:', uri.replace(/:(.*?)@/, ':***@'));
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('SUCCESS! ->', uri.replace(/:(.*?)@/, ':***@'));
      await mongoose.disconnect();
      return;
    } catch (e) {
      console.log('Failed:', e.message);
    }
  }
}
run();
