//Create express app
const { response } = require("express");
const express = require("express");
const app = express();
app.set("view engine", "pug");
app.use(express.json());
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

app.get("/", (req,res)=> {
    res.render("./pages/login",{});
});

const userRouter = require("./routers/user")
app.use("/user", userRouter);

//Database variables
let mongoose = require('mongoose');




//Initialize database connection
mongoose.connect("mongodb://127.0.0.1:27017/database-a5", { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;
  app.listen(3000);
  console.log("Listening on port 3000");
});


