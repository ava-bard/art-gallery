//post request to register user
function registerUser() 
{
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  //user fetch to make post request
  fetch('/registerUser', 
  {
    method: 'POST',
    headers: 
    {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => 
    {
      if (response.ok) 
      {
        alert("Successfully Registered!")
        window.location.href = '/allArt';
      }
      else if(response.status === 400)
      {
        alert("Username is taken! Try another")
      } 
      else {
        return response.text().then(errorMessage => {
          console.error('Registration failed:', errorMessage);
        });
      }
    })
    .catch(error => 
    {
      console.error('Error during registration:', error);
    });
}

//put request to switch to user (patron)
function switchToUser() 
{
  try 
  {
    //use fetch to make request
    fetch('/switchToUser', 
    {
      method: 'PUT',
    })
      .then(response => {
        if (response.ok) 
        {
          alert("Successfully switched to Patron!");
          window.location.reload();
        } 
        else 
        {
          console.error('Failed to switch to user:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error switching to user:', error);
      });
  } 
  catch (error) 
  {
    console.error('Error switching to user:', error);
  }
}

//put request to switch to artist
function switchToArtist() 
{
  try 
  {
    //use fetch to make request
    fetch('/switchToArtist', 
    {
      method: 'PUT',
    })
      .then(response => {
        if (response.ok) 
        {
          alert("Successfully switched to Artist!");
          window.location.reload();
        } 
        else if (response.status === 400) 
        {
          //tell user they need to add art before switching and redirect to addArt page
          alert('You need to add art before switching to artist.');
          window.location.href = '/addArt';
        } 
        else 
        {
          console.error('Failed to switch to artist:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error switching to artist:', error);
      });
  } 
  catch (error) 
  {
    console.error('Error switching to artist:', error);
  }
}

//post request to add art 
function addArt() 
{
  //get from user input in text boxes
  let nTitle = document.getElementById('title').value;
  let nYear = document.getElementById('year').value;
  let nCategory = document.getElementById('category').value;
  let nMedium = document.getElementById('medium').value;
  let nDescription = document.getElementById('description').value;
  let nPoster = document.getElementById('poster').value;
  
  //make new art object
  let newArt = {Title: nTitle, Artist: artist, Year: nYear, Medium: nMedium, Category: nCategory, Description: nDescription, Poster: nPoster};

  //user fetch to add the art
  fetch('/addArt', 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newArt),
  })
    .then(response => {
      if (response.ok) 
      {
        alert("art added!");
        window.location.href = '/allArt';
      } 
      else {
        return response.text().then(errorMessage => 
          {
          alert('error');
          console.error('Registration failed:', errorMessage);
        });
      }
    })
    .catch(error => {
      console.error('Error during registration:', error);
    });
}

//post request to add a workshop
function addWorkshop()
{
  //get from user input in text boxes
  let wtitle = document.getElementById('wtitle').value;
  let wdescription = document.getElementById('wdescription').value;
  let wdate = document.getElementById('wdate').value;
  let wlocation = document.getElementById('wlocation').value;

  //make a new workshop object
  let newWorkshop = {Title: wtitle, Description: wdescription, Date: wdate, Location: wlocation, Artist: wArtist,};
  
  //use fetch to add the workshop
  fetch('/addWorkshop', 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newWorkshop),
  })
    .then(response => {
      if (response.ok) 
      {
        alert("workshop added!");
        window.location.href = '/allArt';
      } 
      else {
        return response.text().then(errorMessage => {
          alert('errr');
          console.error('Registration failed:', errorMessage);
        });
      }
    })
    .catch(error => 
    {
      console.error('Error during registration:', error);
    });
}

//post request to register for the workshop
function registerForWorkshop() 
{
  //use fetch to register
  fetch('/registerForWorkshop', 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workID: workID, user: user }),
  })
    .then(response => {
      if (response.ok) 
      {
        alert('Successfully registered for the workshop');
        window.location.reload();
      } 
      else 
      {
        console.error('Failed to register for the workshop');
      }
    })
    .catch(error => 
      {
      console.error('Error during workshop registration:', error);
    });
}

//post request to follow user
function follow() 
{
  //get the artist's username and the user's username from pug variables
  let artistUsername = artist;
  let userUsername = user;

  //use fetch to follow the user
  fetch(`/follow/${artistUsername}`, 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ artistUsername, userUsername }),
  })
    .then(response => 
      {
      if (!response.ok) 
      {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(data => 
    {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

//post request to unfollow user
function unfollow() 
{
  try 
  {
    //use fetch to unfollow user
    fetch('/unfollow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artistUsername: artist }),
    })
      .then((response) => {
        if (response.ok) 
        {
          window.location.reload();
        } 
        else 
        {
          console.error('Error unfollowing artist');
        }
      })
      .catch((error) => {
        console.error('Error unfollowing artist:', error);
      });
  } catch (error) {
    console.error('Error unfollowing artist:', error);
  }
}

//post request to add like
function addLike() 
{
  //get the artworkId from hidden input
  let artworkId = document.getElementById('artworkId').value;

  //use fetch to add the like
  fetch('/addLike', 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ artworkId }),
  })
    .then((response) => 
    {
      if (response.status === 400) 
      {
        //tell user they already liked
        alert('You already liked this!');
        throw new Error('Already liked');
      }
      return response.json();
    })
    .then((data) => 
    {
      window.location.reload();
    })
    .catch((error) => 
    {
      console.error('Error adding like:', error);
    });
}

//post request to remove the like
function removeLike() 
{
  //get the artworkId from hidden input
  let artworkId = document.getElementById('artworkId').value;

  //use fetch to remove the like
  fetch('/removeLike', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ artworkId }),
  })
    .then((response) => 
    {
      if (response.status === 400) 
      {
        //tell user they didn't like the post
        alert('Not liked');
        throw new Error('Not liked');
      }
      return response.json();
    })
    .then((data) => 
    {
      window.location.reload(); 
    })
    .catch((error) => 
    {
      console.error('Error removing like:', error);
    });
}

//post request to add a review
async function addReview() 
{
  try 
  {
    //get artwork id and content of review
    let artworkId = document.getElementById('artworkId').value; 
    let reviewContent = document.getElementById('reviewContent').value;

    //use fetch to make this request
    let response = await fetch('/addReview', 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artworkId, reviewContent }),
    });

    let data = await response.json();

    if (response.ok) 
    {
      window.location.reload();
    } 
    else 
    {
      console.error(data.message);
    }
  } 
  catch (error) 
  {
    console.error('Error during addReview request:', error);
  }
}

//function to delete review
function deleteReview(reviewId) 
{
  //use fetch to delete
  fetch('/deleteReview', 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reviewId }),
  })
    .then(response => 
      {
      if (!response.ok) 
      {
        console.error('Error deleting review');
      } 
      else 
      {
        window.location.reload();
      }
    })
    .catch(error => 
      {
      console.error('Error deleting review:', error);
    });
}

//function to search for art
document.addEventListener('DOMContentLoaded', () => 
{
  let searchButton = document.getElementById('searchButton');
  //on click, call perform search
  if (searchButton) 
  {
    searchButton.addEventListener('click', function (event) 
    {
      event.preventDefault();
      performSearch();
    });
  }
  //function to perfoem search
  function performSearch() 
  {
    let title = document.getElementById('title').value;
    let artist = document.getElementById('artist').value;
    let category = document.getElementById('category').value;

    //call new url with search queries, handled in server, and go to that page, which calls get /search again
    let newUrl = `/search?Title=${title}&Artist=${artist}&Category=${category}`;
    window.location.replace(newUrl);
  }  
});
//for redirecting with a button
function openReview(url) 
{
    window.location.href = url;
}
