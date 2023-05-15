const passport= require('passport');
const localStrategy = require('passport-local').Strategy;
const User=require('../models/user.model');

passport.use(
  new localStrategy(
  {
    usernameField:'email',
    passwordField:'password',
  },
  async (email,password,done)=>{
    try{
      const user=await User.findOne({email});
      if(!user){
        return done(null,false,{
          message:"Username/email not registered",
      });
      }
       
      const isMatch=await user.isValidPassword(password);
      return isMatch?done(null,user):done(null,false,{message:'Incorrect password'});

    }catch(error){
      done(error);
    }
  }
  )
);

passport.serializeUser(function(user,done){
  done(null,user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    return done(null, await User.findById(id));
  } catch(error) {
    return done(error);
  } 
});