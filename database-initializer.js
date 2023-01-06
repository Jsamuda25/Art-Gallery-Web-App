let gallery = [];
let users = [];
const fs = require("fs");
const { devNull } = require("os");

fs.readFile('gallery.json', 'utf8', function(err,data){
    gallery = JSON.parse(data);
    console.log(gallery);

});

const { debugPort } = require("process");
const mc = require("mongodb").MongoClient;

mc.connect("mongodb://127.0.0.1:27017/database-a5", { useNewUrlParser: true }, function(err, client) {
    if(err) throw err;
    console.log("Connected to datbase!");
    let db = client.db('database-a5');

    db.dropCollection("galleries",function(err, delOK){
      if(err){
        console.log("Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)")
      }else{
          console.log("Cleared the galleries collection.");
      }
 
      db.collection("galleries").insertMany(gallery, function(err, result){
          if(err)throw err;
          console.log("Adding gallery to database.");
          console.log(result);
          client.close();

      });
   });

   db.dropCollection("users",function(err, delOK){
      if(err){
        console.log("Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)")
      }else{
          console.log("Cleared users collection.");
      }
    });

});
