//require statements
const express = require('express');
const session = require('express-session');
const path = require('path');
let gallery = require('./models/gallerySchema');
let users = require('./models/userSchema');
let notifications = require('./models/notificationSchema');
let reviews = require('./models/reviewSchema');
let mongoose = require('mongoose');
let fs = require('fs');
let morgan = require('morgan');
let workshops = require('./models/workshopSchema');

//set and use statements
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//use the session
app.use(session({
	secret: 'some secret here',
	resave: true,
	saveUninitialized: true
}));

//log the session
app.use(function (req, res, next) {
	console.log(req.session);
	next();
});

//connect mongoose
mongoose.connect('mongodb://127.0.0.1/finalProject');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//requests
app.get('/client.js', loadClient);
app.get('/', loadLogin);
app.post('/login', login);
app.get('/registerUser', register);
app.post('/registerUser', registerUser);
app.get('/unauthorized', loadUnauthorized);
app.get('/logout', logout);
app.get('/allArt', auth, loadAllArt);
app.get('/art/:id', auth, loadIndividualArt);
app.get('/profile', auth, loadProfile);
app.get('/addArt', auth, addArtPage);
app.get('/addWorkshop', auth, loadAddWorkshop);
app.post('/addArt', auth, addArtwork);
app.put('/switchToUser', auth, switchToUser);
app.put('/switchToArtist', auth, switchToArtist);
app.post('/addWorkshop', auth, addWorkshop);
app.get('/artist/:username', auth, loadArtistPage);
app.post('/follow/:username', auth, followArtist);
app.get('/workshop/:id', loadWorkshop);
app.post('/registerForWorkshop', registerForWorkshop);
app.post('/addLike', addLike);
app.post('/addReview', addReview);
app.get('/followers', loadFollowers);
app.get('/following', loadFollowing);
app.get('/notifications', loadNotifications);
app.get('/liked', loadLiked);
app.get('/reviewed', loadReviewed);
app.get('/search', searchForArt);
app.post('/removeLike', removeLike);
app.post('/unfollow', unfollowUser);
app.post('/deleteReview', deleteReview);

db.once('open', async () => {
  try 
  {
    //fetch all artworks from gallery collection
    let allArtworks = await gallery.find();
  } 
  catch (error) 
  {
    //if error, tell user
    console.error('Error fetching gallery:', error);
  }
});

//read through client.js
function loadClient(req, res) 
{
  //read the content of the client.js file
  fs.readFile('./public/client.js', 'utf8', function (err, data) 
  {
    //check for errors in file
    if (err) 
    {
      console.error(err);
      res.status(404).send('Not Found');
      return;
    }

    res.set('Content-Type', 'application/javascript');
    //send the data
    res.send(data);
  });
}

//function to load the login page
function loadLogin(req,res)
{
  res.render('login');
}

//function to log the user in
async function login(req, res, next) 
{
  //if user is logged in already
  if (req.session.loggedin) 
  {
    res.status(200).send('Already logged in.');
    return;
  }

  let username = req.body.username;
  let password = req.body.password;

  console.log('Logging in with credentials:');
  console.log('Username: ' + req.body.username);
  console.log('Password: ' + req.body.password);
  try 
  {
    //attempt to find user in database
    let user = await users.findOne({ username, password });

    //if does not exist, redirect to unauthorized page
    if (!user) 
    {
      res.redirect('/unauthorized');
      return;
    }

    //if user exists, set the following default values in the session and redirect to main page
    req.session.loggedin = true;
    req.session.username = username;
    req.session.admin = true;
    req.session.isArtist = user.isArtist;

    res.redirect('/allArt');
  } 
  catch (error) 
  {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//function to load the register user page
function register(req,res)
{
  res.render('registerUser');
}

//function to register the user
async function registerUser(req, res) 
{
  try 
  {
    let { username, password } = req.body;

    //check if username is taken and send 400 bad req if it is
    let existingUser = await users.findOne({ username });
    if (existingUser) 
    {
      return res.status(400).send();
    }

    //create new user with default values
    let newUser = new users({
      username,
      password,
      loggedin: true, 
      isArtist: false,
      admin: true,
      postedArt: [],
      workshops: [],
      followers: [],
      following: [],
      notifications: [],
      ratings: [],
      likes: [],
      reviews: [],
    });
    
    //save to database
    await newUser.save();

    //set up session
    req.session.loggedin = true;
    req.session.username = username;

    //redirect to allArt (home/browse page)
    res.redirect('/allArt');
  } 
  catch (error) 
  {
    console.error('Error registering user:', error);
    res.status(500).send();
  }
}

//function to load the unauthorized page (if user does not exist, wrong password, etc)
function loadUnauthorized(req,res)
{
  res.render('unauthorized');
}

//function to log the user out
function logout(req, res, next) 
{
	if (req.session.loggedin) 
  {
		req.session.loggedin = false;
		req.session.username = undefined;
    //redirect to login page
    res.redirect('/');
	} 
  else 
  {
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

//authorizing function
function auth(req, res, next) 
{
  // if user isn't logged in/does not exist, send 401
  if (!req.session.loggedin) 
  {
    res.status(401).send();
    return;
  }
  next();
}

//function to load all art page
async function loadAllArt(req, res) 
{
  try 
  {
    //make sure user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    //get all artwork from database
    let galleryArray = await gallery.find();

    //render all art page and send session info and array of all art
    res.render('allArt', { session: req.session, galleryArray });
  } 
  catch (error) 
  {
    console.error('Error fetching gallery from the database:', error);
    res.status(500).send();
  }
}

//function to load individual art piece
async function loadIndividualArt(req, res) 
{
  try 
  {
    // Check if the user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    let artId = req.params.id;

    //populate the likes and reviews with the info from the database
    if (!mongoose.Types.ObjectId.isValid(artId)) 
    {
      res.status(400).send('Invalid artId format');
      return;
    }
    
    let artwork = await gallery
      .findById(artId)
      .populate({ path: 'Likes', select: 'username' })
      .populate({
        path: 'Reviews',
        populate: { path: 'user', select: 'username' }
      });

    let username = req.session.username;
    let user = await users.findOne({ username });

    //extract usernames from the populated Likes array
    let ID = user._id;
    let likes = artwork.Likes.map((like) => like.username) || [];

    //extract reviews with the username of the reviewer
    let reviews = artwork.Reviews.map((review) => ({
      user: review.user.username,
      comment: review.comment,
    })) || [];

    //render page with the session, art piece, likes and reviews
    res.render('individualArt', { artwork, session: req.session, likes, reviews });
  } 
  catch (error) 
  {
    console.error('Error fetching individual artwork from the database:', error);
    res.status(500).send();
  }
}

//function to load the user's profile
function loadProfile(req, res) 
{
  res.render('profile', { session: req.session });
}

//function to load the add art page
function addArtPage(req,res)
{
  res.render('addArt',{ session: req.session });
}

//function to load the add workshop page
function loadAddWorkshop(req,res)
{
  res.render('addWorkshop',{ session: req.session });
}

//function to add artwork
async function addArtwork(req, res) 
{
  try 
  {
    //check if the user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    //get variables from req body
    let { Title, Artist, Year, Medium, Category, Description, Poster } = req.body;

    //create new art
    let newArtwork = new gallery({
      Title,
      Artist,
      Year,
      Medium,
      Category,
      Description,
      Poster,
    });

    //save to database
    await newArtwork.save();

    //update user's posted art array
    let updatedUser = await users.findOneAndUpdate({ username: Artist },{ $push: { postedArt: newArtwork._id } },{ new: true });

    //to send notification to followers
    for (let followerId of updatedUser.followers) 
    {
      let notification = new notifications({user: followerId, from: updatedUser._id, type: 'gallery', content: `New Artwork: ${Title}`, gallery: newArtwork._id,});
      let fol = await users.findById(followerId);
      fol.notifications.push(notification);
      //save to database
      await notification.save();
      await fol.save();
    }

    //send success
    res.status(200).json({ message: 'Art added successfully', newArtwork });
  } 
  catch (error) 
  {
    console.error('Error adding art:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//function to switch to patron (user)
async function switchToUser(req, res) 
 {
  try 
  {
    let username = req.session.username;

    //change isArtist in database to false
    await users.findOneAndUpdate({ username }, { isArtist: false });

    //change directly in session
    req.session.isArtist = false;

    //send success
    res.status(200).json({ message: 'Switched to user successfully' });
  } 
  catch (error) 
  {
    console.error('Error switching to user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//function to switch to artist
 async function switchToArtist(req, res)  
 {
  try 
  {
    let username = req.session.username;
    let user = await users.findOne({ username });

    //if user hasn't posted art, send 400 bad req error (in client side redirects to add art page)
    if (!user.postedArt || user.postedArt.length === 0) 
    {
      return res.status(400).json({ error: 'Please add art before switching to artist' });
    }

    //update in database and session
    await users.findOneAndUpdate({ username }, { isArtist: true });
    req.session.isArtist = true;

    res.status(200).json({ message: 'Switched to artist successfully' });
  } 
  catch (error) 
  {
    console.error('Error switching to artist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//function to add a workshop
async function addWorkshop(req,res)
{
  try 
  {
    //check if the user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    let { Title, Description, Date, Location, artistUsername } = req.body;

    let Artist = await users.findOne({ username: req.body.Artist });

    //create new workshop
    let newWorkshop = new workshops({Title, Description, Date, Location, Artist});

    //save to database
    await newWorkshop.save();

    //update array
    let updatedUser = await users.findOneAndUpdate({ username: Artist.username },{ $push: { workshops: newWorkshop._id } },{ new: true });

    //loop through followers to send them each notifications
    for (let followerId of updatedUser.followers) 
    {
      let notification = new notifications({user: followerId, from: updatedUser._id, type: 'workshop', content: `New Workshop: ${Title}`, workshop: newWorkshop._id,});
      let fol = await users.findById(followerId);
      fol.notifications.push(notification);
      //save notification
      await notification.save();
      await fol.save();
    }

    res.status(200).json({ message: 'Workshop added successfully', newWorkshop });
  } 
  catch (error) 
  {
    console.error('Error adding art:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//function to load the artist's page
async function loadArtistPage(req, res) 
{
  try 
  {
    let artistUsername = req.params.username;
    let artist = await users.findOne({ username: artistUsername });
    let user = await users.findOne({ username: req.session.username });

    //make sure artist exists
    if (!artist) 
    {
      res.status(404).send('Artist not found');
      return;
    }

    //get art they have posted and their workshops, and their followers
    let artworks = await gallery.find({ Artist: artistUsername });
    let workshopsList = await workshops.find({ Artist: artist._id });
    let followersIds = artist.followers;
    let followers = await users.find({ _id: { $in: followersIds } });

    //extract usernames of followers
    let followerUsernames = followers.map(follower => follower.username);

    //render page with all data
    res.render('artistPage', {session: req.session, artist, artworks, workshops: workshopsList, followers: followerUsernames, ID: user._id});
  } 
  catch (error) 
  {
    console.error('Error loading artist page:', error);
    res.status(500).send('Internal Server Error');
  }
}

//function to follow arist
async function followArtist(req, res) 
{
  try 
  {
    let artistUsername = req.params.username;

    //find the artist in the database and current user
    let artist = await users.findOne({ username: artistUsername });
    let u = await users.findOne({username: req.session.username});

    //make sure artist exists
    if (!artist) 
    {
      res.status(404).send('Artist not found');
      return;
    }

    //check if user is trying to follow themself
    if (req.session.username === artistUsername) 
    {
      res.status(400).send('You cannot follow yourself');
      return;
    }

    //check if already following
    if (artist.followers.includes(req.session.username)) 
    {
      res.status(400).send('You are already following this artist');
      return;
    }

    //update artist's followers array and user's following array
    await users.findOneAndUpdate({ username: artist.username },{ $push: { followers: u._id } },{ new: true });
    await users.findOneAndUpdate({ username: req.session.username },{ $push: { following: artist._id } },{ new: true });

    res.status(200).send('Successfully followed the artist');
  } 
  catch (error) 
  {
    console.error('Error following artist:', error);
    res.status(500).send('Internal Server Error');
  }
}

//function to load workshop page
async function loadWorkshop(req, res) 
{
  try 
  {
    let workshopId = req.params.id;
    let workshop = await workshops.findById(workshopId);

    //check if exists
    if (!workshop) 
    {
      res.status(404).render('error', { message: 'Workshop not found' });
      return;
    }

    //get workshop's artist and registered users
    let artist = await users.findOne({ _id: workshop.Artist });
    let enrolledUsers = await users.find({ _id: { $in: workshop.enrolledUsers } });

    //extract usernames from the enrolled users
    let enrolledUsernames = enrolledUsers.map(user => user.username);

    res.render('workshop', { workshop, session: req.session, artist, enrolledUsernames });
  } 
  catch (error) 
  {
    console.error('Error loading workshop:', error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
}

//function to register user for workshop
async function registerForWorkshop(req, res) 
{
  try 
  {
    let curWorkshop = await workshops.findById(req.body.workID);
    let workUser = await users.findOne({ username: req.body.user });

    //if user wanting to register and current workshop both exist, procees
    if (curWorkshop && workUser) 
    {
      //update workshop
      let updatedWorkshop = await workshops.findOneAndUpdate({ _id: curWorkshop._id },{ $push: { enrolledUsers: workUser._id } },{ new: true });
      res.status(200).json({ message: 'Successfully registered for the workshop', updatedWorkshop });
    } 
    else 
    {
      res.status(404).json({ error: 'Workshop or user not found' });
    }
  } 
  catch (error) 
  {
    console.error('Error during workshop registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//function to like an art piece
async function addLike(req, res) 
{
  try 
  {
    let { artworkId } = req.body;
    let { username } = req.session;

    let artwork = await gallery.findById(artworkId);
    let likeUser = await users.findOne({ username });

    //if artwork does not exist, send bad req
    if (!artwork) 
    {
      res.status(404).json({ message: 'Artwork not found' });
      return;
    }

    //if already liked, send bad req
    if (artwork.Likes.some((like) => like.equals(likeUser._id))) 
    {
      res.status(400).json({ message: 'Already liked' });
      return;
    }

    //add the like to artwork and user and save the artwork and user
    artwork.Likes.push(likeUser._id);
    await artwork.save();
    likeUser.Likes.push(artworkId);
    await likeUser.save();

    res.status(200).json({ message: 'Like added successfully' });
  } 
  catch (error) 
  {
    console.error('Error during addLike:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//function to add review
async function addReview(req, res) 
{
  try 
  {
    let { artworkId, reviewContent } = req.body;
    let { username } = req.session;
    let artwork = await gallery.findById(artworkId);
    let revUser = await users.findOne({ username });

    //if artwork doesn't exist, send 400 bad req
    if (!artwork) 
    {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    //if user doesn't exist, send 400 bad req
    if (!revUser) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    //create new review and save
    let newReview = new reviews({user: revUser._id, gallery: artwork._id, comment: reviewContent});
    await newReview.save();

    //update artwork's reviews and user's reviews
    artwork.Reviews.push(newReview._id);
    await artwork.save();
    revUser.Reviews.push(newReview._id);
    await revUser.save();

    res.status(200).json({ message: 'Review added successfully' });
  } 
  catch (error) 
  {
    console.error('Error during addReview:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//function to load followers
async function loadFollowers(req, res) 
{
  try 
  {
    //check if user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    let username = req.session.username
    let user = await users.findOne({username});
    
    //check if the user exists
    if (!user) 
    {
      res.status(404).send('User not found');
      return;
    }

    let followers = user.followers;
    let followerUsernames = await users.find({ _id: { $in: followers } });

    res.render('followers', { user, followers, session: req.session, followerUsernames });
  } 
  catch (error) 
  {
    console.error('Error loading followers:', error);
    res.status(500).send('Internal Server Error');
  }
}

//function to load following page
async function loadFollowing(req, res) 
{
  try 
  {
    //check if user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    let username = req.session.username
    let user = await users.findOne({username});
    
    //check if user exists
    if (!user) 
    {
      res.status(404).send('User not found');
      return;
    }

    let following = user.following;
    let followingUsernames = await users.find({ _id: { $in: following } });
    
    res.render('following', { user, following, session: req.session, followingUsernames });
  } 
  catch (error) 
  {
    console.error('Error loading followers:', error);
    res.status(500).send();
  }
}

//function to load notifications
async function loadNotifications(req, res) 
{
  try 
  {
    let username = req.session.username;

    //populate to get the notification objects from database
    let user = await users.findOne({ username }).populate('notifications');

    //if user doesn't exist
    if (!user) 
    {
      return res.status(404).send();
    }

    res.render('notifications', { session: req.session, notifications: user.notifications });
  } 
  catch (error) 
  {
    console.error('Error loading notifications:', error);
    res.status(500).send();
  }
}

//function to load liked posts
async function loadLiked(req,res)
{
  try
  {
    let username = req.session.username;
    let user = await users.findOne({username});
    //if user doesn't exist
    if(!user)
    {
      return res.status(404).send();
    }

    //find liked objects in gallery
    let likess = await gallery.find({ _id: { $in: user.Likes } });
    
    res.render('liked', {session: req.session, Likes: likess});
  }
  catch(error)
  {
    console.error('Error loading liked', error);
    res.status(500).send();
  }
}

//function to load reviews
async function loadReviewed(req, res) 
{
  try 
  {
    let username = req.session.username;
    let user = await users.findOne({ username }).populate('Reviews');

    //if user doesn't exist
    if (!user) 
    {
      return res.status(404).send();
    }

    //reviews from user
    let reviews = user.Reviews;

    res.render('reviewed', { session: req.session, Reviews: reviews });
  } 
  catch (error) 
  {
    console.error('Error loading Reviews', error);
    res.status(500).send();
  }
}

//function to search for art
async function searchForArt(req, res) 
{
  let { Title, Artist, Category } = req.query;
  let query = {};

  //use regex to find title category and artist regardless of the case (upper or lower)
  if (Title) query.Title = { $regex: new RegExp(Title, 'i') };
  if (Artist) query.Artist = { $regex: new RegExp(Artist, 'i') };
  if (Category) query.Category = { $regex: new RegExp(Category, 'i') };
  
  try 
  {
    //find artworks with those pages 
    let artworks = await gallery.find(query);
    res.render('search', { artworks, session: req.session });
  } 
  catch (error) 
  {
    console.error('Error fetching artworks:', error);
    res.status(500).send('Internal Server Error');
  }
}

//function to remove like
async function removeLike(req, res) 
{
  try 
  {
    let { artworkId } = req.body;
    let { username } = req.session;
    let artwork = await gallery.findById(artworkId);
    let likeUser = await users.findOne({ username });

    //if art doesn't exist
    if (!artwork) 
    {
      res.status(404).json({ message: 'Artwork not found' });
      return;
    }

    //if not liked yet
    if (!artwork.Likes.some((like) => like.equals(likeUser._id))) 
    {
      res.status(400).json({ message: 'Not liked yet' });
      return;
    }

    //remove like from artwork and from user
    artwork.Likes = artwork.Likes.filter((like) => !like.equals(likeUser._id));
    await artwork.save();
    likeUser.Likes = likeUser.Likes.filter((id) => !id.equals(artworkId));
    await likeUser.save();

    res.status(200).json({ message: 'Like removed successfully' });
  } 
  catch (error) 
  {
    console.error('Error during removeLike:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//function to unfollow user
async function unfollowUser(req, res)
{
  try 
  {
    // Check if the user is logged in
    if (!req.session.loggedin) 
    {
      res.redirect('/unauthorized');
      return;
    }

    let loggedInUsername = req.session.username;
    let artistUsername = req.body.artistUsername;
    let loggedInUser = await users.findOne({ username: loggedInUsername }).populate('notifications');
    let artistToUnfollow = await users.findOne({ username: artistUsername });

    //make sure both users exist
    if (!loggedInUser || !artistToUnfollow) 
    {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    //delete all notifications from followed user from the user unfollowing's notifications array
    for (let i = loggedInUser.notifications.length - 1; i >= 0; i--) 
    {
      let notification = loggedInUser.notifications[i];
    
      //if the notification is from the user that is being unfollowed, remove the notification
      if (notification.from && notification.from.equals && typeof notification.from.equals === 'function') 
      {
        if (notification.from.equals(artistToUnfollow._id)) 
        {
          loggedInUser.notifications.splice(i, 1);
        }
      } 
      else 
      {
        console.error('Invalid notification.from:', notification.from);
      }
    }
    
    //save updated user and check if the user is following the user they want to unfollow
    await loggedInUser.save();
    let isFollowing = loggedInUser.following.includes(artistToUnfollow._id);

    if (!isFollowing) 
    {
      res.status(400).json({ message: 'Not following this artist' });
      return;
    }

    //remove the artistToUnfollow from the list of artists the loggedInUser is following and save
    loggedInUser.following = loggedInUser.following.filter(id => id.toString() !== artistToUnfollow._id.toString());
    await loggedInUser.save();

    //remove the loggedInUser from the unfollowed artist's followers array and save
    artistToUnfollow.followers = artistToUnfollow.followers.filter(id => id.toString() !== loggedInUser._id.toString());
    await artistToUnfollow.save();

    res.status(200).json({ message: 'Unfollowed successfully' });
  } 
  catch (error) 
  {
    console.error('Error during unfollow:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//function to delete a review
async function deleteReview(req, res)  
{
  try 
  {
    let { reviewId } = req.body;
    let deletedReview = await reviews.findByIdAndDelete(reviewId);

    //if successful, send successful, otherwise, send error
    if (deletedReview) 
    {
      res.status(200).json({ message: 'Review deleted successfully' });
    } 
    else 
    {
      res.status(404).json({ error: 'Review not found' });
    }
  } 
  catch (error) 
  {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

app.listen(3000);
console.log('Server listening at http://localhost:3000');
