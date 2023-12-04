require('dotenv').config();
const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const genToken = require('../utils/GenerateToken');
const FetchUser = require('../middleware/FetchUser');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

const sendMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const options = {
        from: process.env.USER,
        to: email,
        subject: 'Project Management App OTP',
        html: `<h4>Your one time password for updation of your password is ${otp}. It is valid for only 5 mins. Please do not share it with anyone. <br /> Thanking You!</h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Email Sent Successfully.');
                resolve(info);
            }
        });
    });
}

router.post('/register', async (req, res) => {
    const { name, email, password, profilePic } = req.body;

    try {
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields' });

        let user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ success: false, message: 'User already exists' });

        const salt = await bcryptjs.genSalt(10);
        const secPass = await bcryptjs.hash(password, salt);

        user = await User.create({ name, email, password: secPass, profilePic });
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields' });

        let user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'Failed to fetch user. Please register' });

        const matched = await bcryptjs.compare(password, user.password);
        if (!matched)
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        res.status(200).json({ success: true, user: { user, token: genToken(user._id) } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.get('/getUser', FetchUser, async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
        ]
    } : { success: false, message: "No users found" };

    try {
        const user = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/updateProfile', FetchUser, async (req, res) => {
    const { name, email, profilePic } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { name, email, profilePic }, { new: true });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/sendOtp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'No user Fetched. Please Register' });

        const otp = await Otp.create({
            email,
            otp: Math.floor(Math.random() * 100000),
            expiresIn: new Date().getTime() * 5 * 60 * 1000
        })

        sendMail(email, otp.otp);
        res.status(200).json({ success: true, otp });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/changePassword', async (req, res) => {
    const { otp, password, email } = req.body;

    try {
        const validOtp = await Otp.findOne({ email, otp });

        if (validOtp) {
            const diff = validOtp.expiresIn - new Date().getTime();

            if (diff < 0)
                return res.status(400).json({ success: false, message: 'OTP Expired' });

            const salt = await bcryptjs.genSalt(10);
            const secPass = await bcryptjs.hash(password, salt);

            const user = await User.findOneAndUpdate({ email }, { password: secPass }, { new: true });
            res.status(200).json({ success: true, user });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

module.exports = router;