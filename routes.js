var express = require('express');
var User = require('./models/user');
var passport = require('passport');
var router = express.Router();

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

router.get('/', function (req, res, next) {
  User
    .find()
    .sort({
      createdAt: 'descending'
    })
    .exec(function (err, users) {
      if (err) {
        return next(err);
      }
      res.render('index', {
        users: users
      });
    });
});

/*Adding sign-up routes*/
router.get('/signup', function (req, res) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  

  //Call finOne to return just one match on usernames here
  User.findOne({
    username: username
  }, function (err, user) {
        if (err) {
          return next(err);
        }

      //If you find a user, you should bail out because that username already exists
      if (user) {
        req.flash('error', 'User already exists');
        return res.redirect('/signup');
      }

      //else create a new instance of the User model with the username and password
      var newUser = new User({
        username: username,
        password: password
      });

      //Save the new user to the database and continue to the next request handler
      newUser.save(next);
  });
  //Authenticate the user
}, passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}));

/*The profile route*/
router.get('/users/:username', function(req, res, next){
  User.findOne({username: req.params.username}, function(err, user){
    if(err){
      return next(err);
    }
    if(!user){
      return next(404);
    }
    res.render('profile', {user: user});
  });
});


/*The login route*/
router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login', passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

/*The edit route*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    req.flash('info', 'You must be logged in to see this page.');
    res.redirect('/login');
  }
}

router.get('/edit', ensureAuthenticated, function(req, res){
  res.render('edit');
});

router.post('/edit', ensureAuthenticated, function(req, res, next){
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err){
    if(err){
      next(err);
      return;
    }
    req.flash('info', 'Profile updated!');
    res.redirect('/edit');
    
  });
})





























module.exports = router;