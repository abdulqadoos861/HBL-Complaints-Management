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

        if (user.isActive === false) {
            return res.status(403).json({ message: "Your account has been deactivated. Please contact the administrator." });
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
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

exports.forgotPassword = async function (req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email address is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email address" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiry (10 minutes from now)
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP and Expiry in DB
        user.resetOTP = otp;
        user.resetOTPExpires = expiry;
        await user.save();

        // Send Email
        const { sendMail } = require('../utils/mailer');
        await sendMail(
            email,
            'Password Reset OTP - HBL Complaints',
            `Dear User,\n\nYour OTP for resetting your password is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.\n\nRegards,\nHBL Support Team`,
            `<h3 style="color:#008269;">Password Reset Request</h3>
             <p>Dear User,</p>
             <p>You requested to reset your password for the HBL Complaints Management system. Use the following OTP to proceed:</p>
             <div style="background:#f4f4f4;padding:20px;border-radius:12px;font-size:2em;text-align:center;margin:24px 0;border:1px solid #008269;font-weight:bold;color:#008269;letter-spacing:5px;">
                ${otp}
             </div>
             <p>This code is valid for <strong>10 minutes</strong>. If you did not make this request, your account is still secure with your original credentials and you can safely ignore this email.</p>
             <br><p>Regards,<br>HBL Support Team</p>`
        );

        return res.json({ success: true, message: "A 6-digit OTP has been sent to your email." });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        return res.status(500).json({ success: false, message: "An error occurred while sending OTP." });
    }
};

exports.resetPassword = async function (req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
        }

        const user = await userModel.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Update password and clear OTP fields
        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        return res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
    } catch (err) {
        console.error('Reset Password Error:', err);
        return res.status(500).json({ success: false, message: "An error occurred while resetting password." });
    }
};

exports.checklogin = async function (req, res) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.json({ isAuthenticated: false });
        } else {
            const data = jwt.verify(token, process.env.JWT_KEY);
            const user = await userModel.findOne({ username: data.username }).lean();

            if (!user) {
                res.clearCookie('token');
                return res.json({ isAuthenticated: false });
            }

            if (user.isActive === false) {
                res.clearCookie('token');
                return res.json({ isAuthenticated: false, message: "Account deactivated" });
            }

            let redirectUrl = '/login';
            let department = null;

            if (user.role === 'admin') {
                redirectUrl = '/admin';
            } else if (user.role === 'employee') {
                const employee = await employeeModel.findOne({ user: user._id }).lean();
                department = employee?.department?.trim().toLowerCase() || null;
                redirectUrl = department === 'support' ? '/support' : '/employee';
            } else if (user.role === 'customer') {
                redirectUrl = '/customer';
            }

            return res.json({
                isAuthenticated: true,
                role: user.role,
                department: department,
                redirectUrl: redirectUrl
            });
        }
    } catch {
        res.clearCookie('token');
        return res.json({ isAuthenticated: false });
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

        // Send Welcome Email (Non-blocking)
        const { sendMail } = require('../utils/mailer');
        sendMail(
            email,
            'Welcome to HBL Complaints Management',
            `Dear ${name},\n\nYour account has been created successfully. Your customer ID is ${customer_id}.\n\nYou can now log in to register and track your complaints.\n\nRegards,\nHBL Support Team`,
            `<h3>Welcome to HBL Complaints Management</h3><p>Dear ${name},</p><p>Your account has been created successfully. Your customer ID is <strong>${customer_id}</strong>.</p><p>You can now log in to register and track your complaints.</p><br><p>Regards,<br>HBL Support Team</p>`
        ).catch(err => console.error("Failed to send welcome email:", err.message));

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
        const user = await userModel.findOne({ username: req.user.username }).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        let profileData = null;
        if (user.role === 'customer') {
            profileData = await customerModel.findOne({ user: user._id }).lean();
        } else {
            profileData = await employeeModel.findOne({ user: user._id }).lean();
        }

        return res.status(200).json({ user, profileData });
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

exports.submitContact = async function (req, res) {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const { sendMail } = require('../utils/mailer');
        
        // Send email to Admin
        await sendMail(
            process.env.SMTP_USER,
            `New Contact Inquiry from ${name}`,
            `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            `<h3 style="color:#008269;">New Contact Form Submission</h3>
             <div style="background:#f4f4f4;padding:20px;border-radius:12px;margin:20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
             </div>
             <p>This message was sent from the HBL Complaints Management landing page.</p>`
        );

        // Optional: Send auto-reply to user
        await sendMail(
            email,
            'Thank you for contacting HBL Support',
            `Dear ${name},\n\nThank you for reaching out. We have received your message and will get back to you shortly.\n\nRegards,\nHBL Team`,
            `<h3 style="color:#008269;">We've received your message!</h3>
             <p>Dear ${name},</p>
             <p>Thank you for reaching out to HBL Complaints Management. This is an automated confirmation that we have received your inquiry. Our team will review your message and get back to you as soon as possible.</p>
             <br><p>Regards,<br>HBL Support Team</p>`
        ).catch(err => console.error('Failed to send auto-reply:', err.message));

        return res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (err) {
        console.error('Contact Form Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
};
