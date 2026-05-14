const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Employee = require('../models/employee');
const User = require('../models/user');

async function check() {
  await mongoose.connect(process.env.DATABASE_URL);
  const employees = await Employee.find();
  console.log('Employees:', JSON.stringify(employees, null, 2));
  const users = await User.find();
  console.log('Users:', JSON.stringify(users, null, 2));
  await mongoose.connection.close();
}

check();
