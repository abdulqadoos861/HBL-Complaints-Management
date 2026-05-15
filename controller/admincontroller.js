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

    // Send Welcome Email with Credentials (Non-blocking)
    try {
      const { sendMail } = require('../utils/mailer');
      sendMail(
        email,
        'Welcome to HBL - Your Employee Credentials',
        `Dear ${name},\n\nYou have been registered as an employee in the HBL Complaints Management System.\n\nYour credentials are:\nEmployee ID: ${employee_id}\nUsername: ${username}\nTemporary Password: ${password}\n\nPlease login and change your password immediately.\n\nRegards,\nHBL Admin Team`,
        `<h3>Welcome to the Team, ${name}!</h3>
         <p>You have been onboarded to the HBL Complaints Management System.</p>
         <div style="background:#f4f4f4;padding:20px;border-radius:10px;margin:20px 0;">
           <p><strong>Employee ID:</strong> ${employee_id}</p>
           <p><strong>Username:</strong> ${username}</p>
           <p><strong>Temporary Password:</strong> <span style="color:#a91b2c;font-weight:bold;">${password}</span></p>
         </div>
         <p>Please use these credentials to <a href="http://localhost:4200/login">login</a> and complete your profile.</p>
         <br><p>Regards,<br>HBL Admin Team</p>`
      );
    } catch (mailErr) {
      console.error('Failed to send employee welcome email:', mailErr);
    }

    return res.json({
      ok: true,
      message: `Employee added successfully. Credentials sent to ${email}`,
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
    const employees = await Employee.find().sort({ createdAt: -1 }).populate('user', 'isActive').lean();
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

async function toggleEmployeeStatus(req, res) {
  try {
    const { employeeId } = req.params;
    const { isActive } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ ok: false, message: 'Employee not found' });
    }

    await User.findByIdAndUpdate(employee.user, { isActive });

    return res.json({
      ok: true,
      message: `Employee account ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: 'Server error while toggling employee status'
    });
  }
}

module.exports = {
  addEmployee,
  getAllEmployees,
  toggleEmployeeStatus
};
