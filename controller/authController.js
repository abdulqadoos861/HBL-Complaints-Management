const userModel = require('../models/user')
const employeeModel = require('../models/employee')
const customerModel = require('../models/customer')
const jwt = require('jsonwebtoken')

exports.login = async function (req, res) {
    try {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: "User does not exist" });
        }

        if (password === user.password) {
            const token = jwt.sign({ 
                username: user.username, 
                email: user.email,
                role: user.role 
            }, process.env.JWT_KEY);

            res.cookie('token', token, { 
                httpOnly: true, 
                secure: false, // Set to true if using HTTPS
                sameSite: 'lax',
                path: '/'
            });

            // Find employee details if it's an employee role
            let department = null;
            if (user.role === 'employee') {
                const employee = await employeeModel.findOne({ user: user._id });
                department = employee?.department?.trim().toLowerCase() || null;
            }

            return res.json({ 
                message: "Login successful",
                token: token,
                role: user.role,
                department: department
            });
        } else {
            return res.status(401).json({ message: "Incorrect password" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred during login" });
    }
}

exports.checklogin = async function (req, res) {
    try {
        const token = req.cookies.token;
        const isApi = req.originalUrl.startsWith('/api') || req.xhr;

        if (!token) {
            if (isApi) return res.json({ isAuthenticated: false });
            return res.render('login');
        } else {
            const data = jwt.verify(token, process.env.JWT_KEY);
            const username = data.username;
            const usertype = await userModel.findOne({ username: username });
            
            if (!usertype) {
                res.clearCookie('token');
                if (isApi) return res.json({ isAuthenticated: false });
                return res.render('login');
            }

            let redirectUrl = '/login';
            let department = null;

            if (usertype.role === 'admin') {
                redirectUrl = '/adminDashboard';
            } else if (usertype.role === 'employee') {
                const employee = await employeeModel.findOne({ user: usertype._id });
                if (employee && employee.department && employee.department.trim().toLowerCase() === 'support') {
                    redirectUrl = '/supportDashboard';
                    department = 'support';
                } else {
                    redirectUrl = '/employeeDashboard';
                }
            } else if (usertype.role === 'customer') {
                redirectUrl = '/customerDashboard';
            }

            if (isApi) {
                return res.json({ 
                    isAuthenticated: true, 
                    role: usertype.role,
                    department: department,
                    redirectUrl: redirectUrl 
                });
            }

            res.redirect(redirectUrl);
        }
    } catch {
        res.clearCookie('token');
        const isApi = req.originalUrl.startsWith('/api') || req.xhr;
        if (isApi) return res.json({ isAuthenticated: false });
        return res.render('login');
    }
}
exports.signup = async function (req, res) {
    try {
        const { username, email, password, name, cnic, mobile, account_number } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('User already exists with this username or email');
        }

        // Create User
        const user = await userModel.create({
            username,
            email,
            password, // NOTE: Use hashing (bcrypt) in production
            role: 'customer'
        });

        // Generate customer_id
        const customer_id = 'CUST-' + Date.now();

        // Create Customer profile
        await customerModel.create({
            customer_id,
            name,
            cnic,
            mobile,
            account_number,
            user: user._id
        });

        return res.status(201).json({ 
            message: "Registration successful. You can now log in.",
            customerId: customer_id 
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ 
            message: "An error occurred during registration. Please try again." 
        });
    }
}

exports.getProfile = async function (req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username });
        if (!user) return res.redirect('/login');

        let profileData = null;
        if (user.role === 'customer') {
            profileData = await customerModel.findOne({ user: user._id });
        } else {
            profileData = await employeeModel.findOne({ user: user._id });
        }

        if (req.originalUrl.startsWith('/api') || req.xhr) {
            return res.status(200).json({ user, profileData });
        }

        res.render('profile', { user, profileData, success: req.query.success });
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateProfile = async function (req, res) {
    try {
        const { email, password, name, mobile } = req.body;
        const user = await userModel.findOne({ username: req.user.username });

        if (!user) return res.status(404).send('User not found');

        // Update core credentials
        if (email) user.email = email;
        if (password && password.trim() !== "") user.password = password;
        await user.save();

        const isApi = req.originalUrl.startsWith('/api') || req.xhr;

        // Update role-specific profile
        if (user.role === 'customer') {
            await customerModel.findOneAndUpdate(
                { user: user._id },
                { name, mobile }
            );
        } else {
            await employeeModel.findOneAndUpdate(
                { user: user._id },
                { name }
            );
        }

        if (isApi) {
            return res.json({ success: true, message: 'Profile updated successfully' });
        }
        res.redirect('/profile?success=1');
    } catch (e) {
        console.error(e);
        const isApi = req.originalUrl.startsWith('/api') || req.xhr;
        if (isApi) {
            return res.status(500).json({ success: false, message: 'Failed to update profile' });
        }
        res.status(500).send('Failed to update profile');
    }
};
