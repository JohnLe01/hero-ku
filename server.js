/*
POST example
curl -H "Content-Type: application/json" -d '{"firstName":"Chris", "lastName": "Chang", "email": "support@mlab.com"}' http://morning-badlands-24515.herokuapp.com/devices
*/

var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var FIRSTBUILD_DIAGNOSTICS = "1B-diagnostics";

var app = express();
app.use(express.static(__dirname + "/src/public"));
app.use(bodyParser.json());

// Connect to the database before starting the application server.
var database;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, _database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  database = _database;
  app.listen(process.env.PORT || 8080);
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({
    "error": message
  });
}

app.get("/devices", function(req, res) {
  database.collection(FIRSTBUILD_DIAGNOSTICS).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get devices.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/devices", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  console.log("Trying to POST a new device");
  console.log("Request");
  console.log(newContact);

  database.collection(FIRSTBUILD_DIAGNOSTICS).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new device.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });

  // res.status(201).json("");
});

/*  "/contacts/:id"
 *    GET: find device by id
 *    PUT: update device by id
 *    DELETE: deletes device by id
 */

app.get("/contacts/:id", function(req, res) {
  database.collection(FIRSTBUILD_DIAGNOSTICS).findOne({
    _id: new ObjectID(req.params.id)
  }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get device");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  database.collection(FIRSTBUILD_DIAGNOSTICS).updateOne({
    _id: new ObjectID(req.params.id)
  }, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update device");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  database.collection(FIRSTBUILD_DIAGNOSTICS).deleteOne({
    _id: new ObjectID(req.params.id)
  }, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete device");
    } else {
      res.status(204).end();
    }
  });
});
