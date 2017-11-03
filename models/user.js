var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  displayName: String,
  bio: String
});

userSchema.methods.name = function () {
  return this.displayName || this.username;
};

//A do-nothing function for use with the bcrypt module
var noop = function () {};

/*Creating the user's password*/

//Defines a function that runs before model is saved
userSchema.pre('save', function (done) {
  //Save a reference to the user
  var user = this;

  //Skip this logic if password isn't modified
  if (!user.isModified('password')) {
    return done();
  }

  //Generate a salt for the hash, and call the inner function once completed
  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) {
      return done(err);
    }

    //If no error, hash the user's password
    bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
      if (err) {
        return done(err);
      }

      //If no error, store the password and continue with the saving
      user.password = hashedPassword;
      done();
    });
  });
});



/*Checking the user's password*/
userSchema.methods.checkPassword = function (guess, done) {
  bcrypt.compare(guess, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

//Attach this schema to an actual model
var User = mongoose.model('User', userSchema);

//export it so other modules can require it
module.exports = User;