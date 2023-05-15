const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const { roles} = require('../utils/constants');
const {permissions}=require('../utils/constantspermission');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [roles.super_admin, roles.admin, roles.manager,roles.member],
    default: roles.member,
  },
  permission: {
    type: String,
    enum: [permissions.SUPER_ADMIN, permissions.ADMIN, permissions.MANAGER,permissions.MEMBER],
    default: permissions.MEMBER,
  },
  
});

UserSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      if (this.email === process.env.ADMIN_EMAIL.toLowerCase()) {
        this.role = roles.admin;
        this.permission=permissions.SUPER_ADMIN;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
};

const User = mongoose.model('user', UserSchema);
module.exports = User;