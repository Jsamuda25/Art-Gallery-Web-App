
let mongoose = require('mongoose');
const Schema = mongoose.Schema

let types = ["Patron", "Artist"];

// schema for users collection in database
let userSchema = new Schema({
    username: String,
    password: String,
    following: [],
    liked: [],
    isArtist: Boolean,
    published:[],
    titles:[],
    reviews:[],
    workshops:[],
    registered:[],
    notifications:[]
});
let userModel = mongoose.model('users', userSchema);

//schema for art collection in database
let artSchema = new Schema({
    name : String,
    artist :String,
    year: String,
    category: String,
    medium: String,
    description: String,
    image: String,
    likes: Number,
    reviews:[]
});

let artModel= mongoose.model('galleries', artSchema);

const express = require('express');
const session = require('express-session');



let router = express.Router()
router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(session({
    secret: 'some secret here', 
	//cookie: {maxAge:50000},  //the cookie will expire in 50 seconds
	resave: true,
	saveUninitialized: true
}));
const fs = require("fs");
const { resolveSoa, lookup } = require('dns');
const exp = require('constants');
const e = require('express');

let db = mongoose.connection;
let gallery = {};

// list of various routes and the functions that handle them
router.post("/login", express.json(), userLogin);
router.post("/register", express.json(), userRegister);
router.get("/register", express.json(), registerGet);
router.get("/home", auth, homeGet);
router.get("/artists/:name", auth, showArtist);
router.get("/follow/:name", auth, followArtist);
router.get("/following", auth, listFollowing);
router.get("/liked/:name",auth, addLiked);
router.get("/liked", auth, showLiked);
router.post("/upload",express.json(),auth, uploadArt);
router.get("/upload",auth,uploadPage);
router.get("/homeArtist",auth, changeType);
router.get("/catalogue", auth, yourWork);
router.get("/logout",auth, userLogout)
router.post("/search", auth, express.json(), searchKeyword);
router.get("/review/:name", auth, reviewGET);
router.post("/addreview/:title", auth, express.json(), addReview);
router.get("/piece/:name",auth, express.json(),showPiece);
router.get("/reviews",auth, loadMyReviews);
router.delete("/delete/:review", auth, express.json(), deleteOpinion);
router.get("/seeReviews/:name", auth, allReviews);
router.get("/createWorkshop",auth, createWorkshop);
router.post("/createWorkshop", auth, express.json(), makeWorkshop);
router.get("/viewShops/:artist",auth, express.json(),viewWorkshops);
router.put("/enroll/:name",auth,express.json(), enroll);
router.get("/enrolled", auth, showEnrolled);
router.get("/patron", auth, patron);
router.get("/notifications", auth, showNotifications);
router.get("/*", auth, errorPage);

/*
Function: auth()
 Purpose: Function that handles authorization, especially not allowing access to pages if user is not logged
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function auth(req, res, next){
    // based off lecture code about sessions
    if(!req.session.loggedin){
        res.status(401).render("./pages/error", {message: "Not logged in!"})
    }    
    next();
}

/*
Function: errorPage()
 Purpose: Handles when an non-existent route is typed in or requested by serving an error page.
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function errorPage(req, res, next){
    res.status(404).render("./pages/error",{message: "Page not found!"});
}

/*
Function: addLiked()
 Purpose: user liking posts, adding it to their likes and updating the liked value is art
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function addLiked(req,res,next){
    let title = req.params.name;
    db.collection("galleries").find({name: title}).toArray(function(err,result){ // find artwork in galleries collection 
        let artwork = result[0].name;
        let likes = result[0].likes;
        if(req.session.liked.includes(artwork)){  // if artwork is already in user's likes, then remove it
            let index = req.session.liked.indexOf(artwork);
            req.session.liked.splice(index,1);
            db.collection("users").updateOne({username: req.session.username},{$set:{liked: req.session.liked}});
            db.collection("galleries").updateOne({name: title},{$set:{likes: likes-1}});
            res.send();
        }
        else{ // if artwork is not in user's likes, then add it into likes list
            req.session.liked.push(title);
            db.collection("users").updateOne({username: req.session.username},{$set:{liked: req.session.liked}});
            db.collection("galleries").updateOne({name: title},{$set:{likes: likes+1}});
            res.send();
          
        }
    });
}

/*
Function: showLiked()
 Purpose: rendering the page of liked art
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function showLiked(req, res,next){
    db.collection("galleries").find({name: {$in:req.session.liked}}).toArray(function(err,result){
        if(err) throw err;
        res.render("./pages/liked",{artwork: result, user: req.session});

    });

}

/*
Function: followArtist()
 Purpose: functionality for following an artist, adding artist to user's following list
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function followArtist(req,res,next){
    let name = req.params.name;
    db.collection("galleries").find({artist: name}).toArray(function(err,result){ // find artist in gallery
        let person = result[0].artist;
        if(req.session.following.includes(person)){ // if artist already exists in user's following, remove artist from following
            let index = req.session.following.indexOf(person);
            req.session.following.splice(index,1);
            db.collection("users").updateOne({username: req.session.username},{$set:{following: req.session.following}});
            res.sendStatus(204);
        }
        else{ // add artist to following list
            req.session.following.push(person);
            db.collection("users").updateOne({username: req.session.username},{$set:{following: req.session.following}});
            res.sendStatus(204);
        }
    });


}

/*
Function: uploadPage()
 Purpose: render the page that allows artist to upload work
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function uploadPage(req,res, next){
    res.render("./pages/upload",{username: req.session.username, user: req.session});
}

/*
Function: uploadArt()
 Purpose: allow user to upload work to database
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function uploadArt(req, res, next){

    let title = req.body.title;
    let author = req.body.artist;
    let year = req.body.year;
    let category = req.body.category;
    let medium = req.body.medium;
    let description = req.body.description;
    let link = req.body.link;

    // if statement checks that none of the information for the artwork is blank
    if(title.length===0 || title.replace(/\s+/g,'') ==="" ||author.length===0 || author.replace(/\s+/g,'') ===""|| year.length===0 || year.replace(/\s+/g,'') ===""||
        category.length===0 || category.replace(/\s+/g,'') ==="" || medium.length===0 || medium.replace(/\s+/g,'') ==="" ||  description.length===0 || description.replace(/\s+/g,'') ==="" ||  
        link.length===0 || link.replace(/\s+/g,'') ===""){
        res.status(400) // send 400 error code
        console.log("Blank")
        return;
    }  

    let newArt = new artModel({name: title, artist: author, year: year, category: category, medium: medium, description: description, image: link, likes:0,reviews:[]});
    req.session.published.push(newArt);
    req.session.titles.push(author);
    db.collection("galleries").insertOne(newArt);
    req.session.isArtist = true;
    db.collection("users").updateOne({username: req.session.username},{$set:{isArtist: true}});
    db.collection("users").updateOne({username: req.session.username},{$set:{published: req.session.published}});
    db.collection("users").updateOne({username: req.session.username},{$set:{titles: req.session.titles}});

    // this serves as the functionality for checking serving notifications to the uploader's followers
    const follower = await db.collection("users").findOne({following:req.session.username});
    if(follower!= null){ // if the follower exists, push a notification to their notification list
        let sentence = req.session.username + " created an artwork called " + title;
        follower.notifications.push(sentence);
        db.collection("users").updateOne({username: follower.username},{$set:{notifications: follower.notifications}});
        if((req.session.username).localeCompare(follower.username)!= 0){
            req.session.notifications.push(sentence);
        }
    }
    res.redirect('/user/catalogue'); // once art is uploaded, send user to their personal catalogue so they can see artwork there
}

/*
Function: registerGet()
 Purpose: render registration page
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function registerGet(req,res,next){   
    res.render("./pages/register",{});
}

/*
Function: listFollowing()
 Purpose: render following page
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function listFollowing(req,res,next){
    db.collection("galleries").find({artist: {$in:req.session.following}}).toArray(function(err,result){
        res.render("./pages/following",{artwork: result, user: req.session});
    });
}

/*
Function: homeGet()
 Purpose: render home page
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function homeGet(req,res,next){
    db.collection("galleries").find().toArray(function(err, result){ // find all art in gallery
        if(err){
            throw err;
        }
        gallery = result;
        if(req.session.isArtist){ // check if user is an artist
            db.collection("galleries").find().toArray(function(err, result){ // load art and send them to the artist version of home screen
                if(err) throw err;
                gallery = result;
                req.session.isArtist=true;
                db.collection("users").updateOne({username: req.session.username},{$set:{isArtist: true}});
                res.render("./pages/homeArtist",{artwork: gallery, options: types, user: req.session});
            });
        }
        else{
            res.render("./pages/home",{artwork: gallery, options: types, user: req.session});
        }
    });

}


/*
Function: changeType()
 Purpose: functionality for changing user account type
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function changeType(req,res,next){
    if(req.session.published.length === 0 && !req.session.isArtist ){ // if user is not an artist and has 0 works published, prompt to make post before switching type
        res.render("./pages/upload",{username: req.session.username, user:req.session});
        return;
    }
    db.collection("galleries").find().toArray(function(err, result){ // if they have published art, allow switch
        if(err) throw err;
        gallery = result;
        req.session.isArtist=true;
        db.collection("users").updateOne({username: req.session.username},{$set:{isArtist: true}});
        res.render("./pages/homeArtist",{artwork: gallery, options: types, user: req.session});
    });


}

/*
Function: userRegister()
 Purpose: functionality for registration of a user
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function userRegister(req,res,next){
    if(req.session.loggedin){
        res.status(200).send("Someone is already logged in.");
        return
    }
    let name = req.body.username;
    let pass = req.body.password;

    // this if statement is to make sure that the username and passwords entered are not empty
    if(name === undefined || name.replace(/\s+/g,'') ==="" || name.length===0 || pass=== undefined || pass.replace(/\s+/g,'') ==="" || pass.length===0 ){
        res.status(400) // send 400 error code
        console.log("Blank")
        return;
    }  
    // set attributes of new user obejct to be inserted in database
    let newUser = new userModel({username: req.body.username, password: req.body.password, following:[], liked:[], isArtist: false, published:[], titles:[], reviews:[], workshops:[], registered:[], notifications:[]});


    // try catch block is inspired by tutorial 9 demo code
    try{
        const searchResult = await db.collection("users").findOne({username: req.body.username});
        if(searchResult == null){
            await db.collection("users").insertOne(newUser);
            // set session attributes to match attributes of newly created/registered user
            req.session.loggedin = true;
            req.session.username = req.body.username;
            req.session.isArtist = false;
            req.session.password = req.body.password;
            req.session.following = newUser.following;
            req.session.liked = newUser.liked;
            req.session.published = newUser.published;
            req.session.reviews = newUser.reviews;
            req.session.titles = newUser.titles;
            req.session.workshops = newUser.workshops;
            req.session.registered = newUser.workshops
            req.session.notifications = newUser.notifications;

            res.redirect('/user/home');
            res.status(200).send();
        }
        else{
            res.status(404).render("./pages/error",{message: "Account Exists!"});
        }
    }
    catch(err){
        res.status(500).json({ error: "Error logging in."});

    }
}

/*
Function: userLogin()
 Purpose: functionality for a user logging in
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function userLogin(req, res, next){
    if(req.session.loggedin){
        res.status(200).send("Someone is already logged in.");
        return
    }

    let name = req.body.username;
    let pass = req.body.password;

    // this if statement is to make sure that the username and passwords entered are not empty
    if(name === undefined || name.replace(/\s+/g,'') ==="" || name.length===0 || pass=== undefined || pass.replace(/\s+/g,'') ==="" || pass.length===0 ){
        res.status(400) // send 400 error code
        console.log("Blank")
        return;
    }  
 
    // this try catch block is inspired by tutorial 9 demo code
    try{
        const searchResult = await db.collection("users").findOne({username: req.body.username, password:req.body.password});
        if(searchResult == null){ // no such user exists
            res.status(200).render("./pages/error",{message: "Account does not exist!"});
            //res.send("Account does not exist!");
        }
        else{
            // update session attributes to match the attributes of user found in database
            req.session.loggedin = true;
            req.session.username = req.body.username;
            req.session.isArtist = searchResult.isArtist;
            req.session.password = req.body.password;
            req.session.following = searchResult.following;
            req.session.liked = searchResult.liked;
            req.session.published = searchResult.published;
            req.session.reviews = searchResult.reviews;
            req.session.titles = searchResult.titles;
            req.session.notifications = searchResult.notifications;
            req.session.workshops = searchResult.workshops;
     
            res.redirect('/user/home')
            res.status(200).send();
          
        }
    }
    catch(err){
        res.status(500).json({ error: "Error logging in."});
    }

}

/*
Function: userLogout()
 Purpose: functionality for a user logging out
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function userLogout(req, res, next){
    req.session.loggedin = false;
    res.render("./pages/login",{});
    
}


/*
Function: showArtist()
 Purpose: functionality for rendering the page of an artists
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function showArtist(req,res,next){
    let name = req.params.name;
    let art;


    try{
        const searchResult = await db.collection("users").findOne({username: name});
        if(searchResult == null){ // no such artist exists
            db.collection("galleries").find({artist: name}).toArray(function(err, result){
                art = result;
                res.render("./pages/artist",{artwork: art, artistName: name, user: req.session});
            });
        }
        else{
            db.collection("galleries").find({artist: name}).toArray(function(err, result){
                art = result;
                res.render("./pages/artist2",{artwork: art, artistName: name, user: req.session, artist: searchResult});
            });
        }
    }
    catch(err){
        res.status(500).json({ error: "Error showing art!"});
    }
    
}

/*
Function: yourWork()
 Purpose: show all the uploaded work of the current user
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function yourWork(req, res, next){
    res.render("./pages/personalCatalogue",{artwork: req.session.published, user: req.session});
}

/*
Function: searchKeyword()
 Purpose: search for an artwork based on field value and render results page
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function searchKeyword(req, res, next){
    let query={};
    let field = req.body.search.toLowerCase(); 
    let field1 = req.body.search; // get field we want to look at
    let value =  String(req.body.lookup); // get value in field
    query[field] = {"$regex":value,"$options":"xi"}
    db.collection("galleries").find(query).toArray(function(err, searchResult){ // find all artwork that match this field and value
		if(err){
			throw err;
		}
		if(!searchResult.length){ 

			res.status(404)
			//res.send("No match!");
            res.status(404).render("./pages/error",{message: "No artwork matches these search parameters!"});
			return;
		}
		else{
            res.render("./pages/searchResult",{artwork: searchResult, type: field1, value: value, user:req.session});
            res.status(200);
		}

	});


}

/*
Function: reviewGet()
 Purpose: render the review page
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function reviewGET(req, res, next){
    
    res.render("./pages/leaveReview",{name:req.params.name, user: req.session});
}

/*
Function: addReview()
 Purpose: functionality for adding a review to art, review is added to artowrk and also to the user's list of reviews
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function addReview(req, res, next){

    let title = req.params.title;
    let comment = req.body.review;
    let reviewObj = {}
    reviewObj.title = title;
    reviewObj.comment= comment;

    // this if statement is to ensure that review field is not black
    if(comment === undefined || comment.replace(/\s+/g,'') ==="" || comment.length===0){
        reviewObj={};
        res.status(400) // send 400 error code
        console.log("Blank")
        return;
    }  

    try{
        const searchResult = await db.collection("galleries").findOne({name: title});
        if(searchResult == null){ // no such user exists
            res.status(200)
            res.send("This piece of art does not exist!");
            reviewObj={};
        }
        else{
            searchResult.reviews.push(reviewObj);
            req.session.reviews.push(reviewObj);
            db.collection("galleries").updateOne({name: title},{$set:{reviews: searchResult.reviews}});
            db.collection("users").updateOne({username: req.session.username},{$set:{reviews: req.session.reviews}});
            res.sendStatus(204);
            reviewObj={}
          
        }
    }
    catch(err){
        reviewObj={}
        res.status(500).json({ error: "Error adding review."});
    }
}

/*
Function: showPiece()
 Purpose: find matching piece of art, and render its page
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function showPiece(req, res, next){
    let title = req.params.name

    try{
        const searchResult = await db.collection("galleries").findOne({name: title});
        if(searchResult == null){ // no such user exists
            res.status(200)
            res.send("This piece of art does not exist!");
        }
        else{
            res.render("./pages/piece",{piece: searchResult, user: req.session});
            res.status(200);
          
        }
    }
    catch(err){
        res.status(500).json({ error: "Error showing piece."});
    }
}

/*
Function: loadMyReviews()
 Purpose: load page that shows all reviews a user has made
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function loadMyReviews(req,res,next){
    res.render("./pages/userReviews",{reviews: req.session.reviews, name:req.session.username, user: req.session});
}

/*
Function: deleteOpinion()
 Purpose: functionality for deleting a review from a piece of art --> review will be deleted from the artwork's and user's review list
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function deleteOpinion(req,res,next){

    let review = JSON.parse(req.params.review)

    for(let i=0; i<req.session.reviews.length;i++){
        if(req.session.reviews[i].comment === review.comment && req.session.reviews[i].title === review.title){
            req.session.reviews.splice(i,1);
            db.collection("users").updateOne({username: req.session.username},{$set:{reviews: req.session.reviews}});

            try{
                const searchResult = await db.collection("galleries").findOne({name: review.title});
                if(searchResult == null){ // no such user exists
                    res.status(200)
                    res.send("This piece of art does not exist!");
                }
                else{
                    for(let j=0; j<searchResult.reviews.length;j++){
                        if(searchResult.reviews[j].comment === review.comment && searchResult.reviews[j].title === review.title){
                            searchResult.reviews.splice(j,1);
                            db.collection("galleries").updateOne({name: review.title},{$set:{reviews: searchResult.reviews}});
                            break;
                        }
                    }
                    res.sendStatus(200);  
                }
            }
            catch(err){
                reviewObj={}
                res.status(500).json({ error: "Error deleting review."});
            }
            break;
        }
    }

}

/*
Function: allReviews()
 Purpose: gets all the reviews made about this piece of art and renders a page full of them
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function allReviews(req,res,next){
    db.collection("galleries").find({name: req.params.name}).toArray(function(err, result){
        if (err) throw err;
        gallery = result[0];
        res.render("./pages/seeReviews",{name: req.params.name, art: gallery,  yourReviews: req.session.reviews, artist:gallery.artist, user: req.session});
    });

}

/*
Function: createWorkshop()
 Purpose: renders page that allows for the creation of a workshop
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function createWorkshop(req, res, next){
    res.render("./pages/createWorkshop",{user:req.session});
}

/*
Function: makeWorkshop()
 Purpose: handles the functionality for creating a workshop --> workshop is added to artist's workshop list and seen as available to other users
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function makeWorkshop(req, res, next){
    let name = req.body.workshop;

    // this if statement is to ensure the workshop information is not blank
    if(name === undefined || name.replace(/\s+/g,'') ==="" || name.length===0){
        res.status(400) // send 400 error code
        console.log("Blank")
        return;
    }  

    try{
        const searchResult = await db.collection("users").findOne({username: req.session.username});
        if(searchResult == null){ // no such user exists
            res.status(401)
            res.send("User does not exist!");
        }
        else{
            searchResult.workshops.push(name);
            req.session.workshops.push(name);
            db.collection("users").updateOne({username: req.session.username},{$set:{workshops: req.session.workshops}});
            const follower = await db.collection("users").findOne({following:req.session.username});
            if(follower!= null){ // functionality for pushing notification of workshop to followers
                let sentence = req.session.username + " created a workshop called " + name;
                follower.notifications.push(sentence); // add notification to follower's notification list
                db.collection("users").updateOne({username: follower.username},{$set:{notifications: follower.notifications}}); 
                if((req.session.username).localeCompare(follower.username) != 0){
                    req.session.notifications.push(sentence);
                }
            }
            res.sendStatus(204);
        }
    }
    catch(err){
        res.status(500).json({ error: "Error creating workshop."});
    }
}

/*
Function: viewWorkshops()
 Purpose: renders page that allows users to see workshops offered by artist
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function viewWorkshops(req, res, next){
    let person = req.params.artist;
    // this try catch block is inspired by tutorial 9 demo code
    try{
        const searchResult = await db.collection("users").findOne({username: person});
        if(searchResult == null){ // no such user exists
            res.status(401)
            res.send("User does not exist!");
        }
        else{
            db.collection("galleries").find({artist: person}).toArray(function(err, result){
                art = result;
                res.render("./pages/viewWorkshops",{artistName: person, user: req.session, creator: searchResult});
            });
        }
    }
    catch(err){
        res.status(500).json({ error: "Error creating workshop."});
    }

}

/*
Function: enroll()
 Purpose: functionality for enrolling in workshop --> workshop is added to user's enrolled list
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function enroll(req,res,next){
    let workshop = req.params.name;

    try{
        const searchResult = await db.collection("users").findOne({username: req.session.username});
        if(searchResult == null){ // no such user exists
            res.status(401)
            res.send("User does not exist!");
        }
        else{
            if(!req.session.registered.includes(workshop)){
                req.session.registered.push(workshop);
                db.collection("users").updateOne({username: req.session.username},{$set:{registered: req.session.registered}});
            }
            res.sendStatus(204);
        }
    }
    catch(err){
        res.status(500).json({ error: "Error registering in workshop."});
    }

}
/*
Function: showEnrolled()
 Purpose: renders page that allows users to see all workshops they are enrolled in
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function showEnrolled(req, res, next){
    res.render("./pages/showEnrolled",{user:req.session});
}

/*
Function: showNotifications()
 Purpose: renders a page that shows the user all workshops they are enrolled in
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
async function showNotifications(req, res, next){
    const follower = await db.collection("users").findOne({username:req.session.username});
    if(follower!=null){ 
        res.render("./pages/notifications", {user:follower}) 
    }
    else{
        res.render("./pages/notifications", {user:req.session})
    }
}


/*
Function: patron()
 Purpose: functionality for switching to patron mode, when reset patron button is clicked
      in: req allows access to a request body object
      in: res will be used to send a response object
      in: next calls for the execution of the next middleware in the stack
  return: no return value
*/
function patron(req, res, next){
    req.session.isArtist = false;
    db.collection("users").updateOne({username: req.session.username},{$set:{isArtist: false}});
    res.redirect("/user/home")
}
module.exports = router;

