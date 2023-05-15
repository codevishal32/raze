const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');
const { permissions } = require('../utils/constantspermission');
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role} = req.body;
    var perm;
    if(role==='SUPER_ADMIN'){perm=permissions.SUPER_ADMIN;}
    else if(role==='ADMIN'){perm=permissions.ADMIN;}
    else if(role=== 'MANAGER'){perm=permissions.MANAGER;}
    else perm=permissions.MEMBER;
    
    console.log(permissions.role);
    //console.log(`Role ${role} permission ${per}`);
    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role:role,permission: perm },
      { new: true, runValidators: true }
    );
    // const user_pre = await User.findByIdAndUpdate(
    //   id,
    //   { permission: perm},
    //   { new: true, runValidators: true }
    // );
    

    req.flash('info', `updated role for ${user.email} to ${user.role} permission to ${user.permission}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

module.exports = router;