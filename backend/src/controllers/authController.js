const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields explicitly
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone'
      });
    }

    // Check if email already registered
    const existingStudent = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'A student account with this email already exists.'
      });
    }

    // Create student (Mongoose will trigger schema validation & password hashing)
    const student = await Student.create({
      name,
      email,
      password,
      phone
    });

    const token = generateToken(student._id);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          createdAt: student.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate student & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Explicitly select password field as it is excluded in the schema
    const student = await Student.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(student._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          createdAt: student.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
