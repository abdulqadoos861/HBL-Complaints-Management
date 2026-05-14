const User = require('../models/user');
const Employee = require('../models/employee');

async function addEmployee(req, res) {
  try {
    const {
      employee_id,
      name,
      department,
      designation,
      username,
      email,
      password
    } = req.body || {};

    if (!employee_id || !name || !username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'employee_id, name, username, email, and password are required'
      });
    }

    const existingEmployee = await Employee.findOne({ employee_id });
    if (existingEmployee) {
      return res.status(409).json({
        ok: false,
        message: 'employee_id already exists'
      });
    }

    // Create employee user
    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }]
    });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: 'Username or email already exists'
      });
    }

    const createdUser = await User.create({
      username,
      email,
      password,
      role: 'employee'
    });

    await Employee.create({
      employee_id,
      name,
      department,
      designation,
      user: createdUser._id.toString()
    });

    return res.json({
      ok: true,
      message: `Employee added successfully with id ${employee_id}`,
      employee_id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: 'Server error while adding employee'
    });
  }
}

async function getAllEmployees(req, res) {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 }).lean();
    return res.json({
      ok: true,
      employees
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: 'Server error while fetching employees'
    });
  }
}

module.exports = {
  addEmployee,
  getAllEmployees
};
