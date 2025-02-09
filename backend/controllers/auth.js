// sendOtp, signup, login, changePassword 

const User = require('./../models/user');
const Profile = require('./../models/profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const OTP = require('../models/otp');