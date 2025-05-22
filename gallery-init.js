//require and schema statements
const mongoose = require("mongoose");
const Gallery = require("./models/gallerySchema");
const User = require("./models/userSchema");
const Workshop = require("./models/workshopSchema");
const Review = require("./models/reviewSchema");
const fs = require("fs");
const path = require("path");

//function to generate gallery list
async function generateGallery(artPieces) 
{
  let galleryList = [];

  for (let currentArt of artPieces) 
  {
    try {
      if (currentArt.Title && currentArt.Artist && currentArt.Year && currentArt.Category && currentArt.Medium && currentArt.Poster) 
      {
        //check if artist exists, if not, create user
        let artist = await User.findOne({ username: currentArt.Artist });
        if (!artist) 
        {
          artist = new User({
            _id: new mongoose.Types.ObjectId(),
            username: currentArt.Artist,
            //default password is artist name
            password: currentArt.Artist,
            loggedin: false, 
            isArtist: true,
          });
          //save artist
          await artist.save();
        }
        //make new gallery entry
        let art = new Gallery({
          _id: new mongoose.Types.ObjectId(),
          Title: currentArt.Title,
          Artist: artist.username,
          Year: currentArt.Year,
          Category: currentArt.Category,
          Medium: currentArt.Medium,
          //if description doesn't exist, make it a blank one
          Description: currentArt.Description || "",
          Poster: currentArt.Poster,
          Likes: [],
          Reviews: [],
        });

        //update and save posted art array
        artist.postedArt.push(art._id);
        await artist.save();

        galleryList.push(art);
      } 
      else 
      {
        console.error(`Skipping artwork. Missing required properties.`);
      }
    } 
    catch (error) 
    {
      console.error(`Error processing artwork: ${currentArt.Title}`, error);
    }
  }
  return galleryList;
}

//function to initialize the database
async function initializeDatabase() 
{
  try 
  {
    //connect to database
    await mongoose.connect('mongodb://127.0.0.1/finalProject');

    //drop current collections and log success
    await mongoose.connection.dropDatabase();
    console.log("Gallery Collection dropped in database finalProject");

    //read art from gallery
    let filePath = path.join(__dirname, 'gallery', 'gallery.json');
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    let artPiecesArray = JSON.parse(fileContent);

    //generate the gallery with above function
    let galleryList = await generateGallery(artPiecesArray);

    //count number of artwork
    let nums = 0;
    for (let artwork of galleryList) 
    {
      try 
      {
        //save each artwork to the database
        await artwork.save();
        nums++;
        //check if all artworks are saved
        if (nums >= galleryList.length) 
        {
          console.log("All artworks saved.");
        }
      } 
      catch (error) 
      {
        //log and throw an error if saving fails
        console.error("Error saving artwork:", error);
        throw error;
      }
    }
  } 
  catch (error) 
  {
    //log error if one is caught
    console.error("Initialization failed:", error);
  } 
  finally 
  {
    //close connection
    mongoose.connection.close();
  }
}

//call initialize database function
initializeDatabase();
