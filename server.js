var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var R = 6378137;

var ATL_COLLECTION = "atl";

var app = express();
app.use(bodyParser.urlencoded());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

var uri = "mongodb://test:test@ds149577.mlab.com:49577/heroku_zr578mwn";

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(uri, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/api/crimes"
 *    GET: finds all crimes
 */

app.get("/api/crimes", function(req, res) {
  db.collection(ATL_COLLECTION).find({}).toArray(function(err,docs) {
    if (err) {
      handleError(res, err.message, "Failed to get crimes");
    } else {
      res.status(200).json(docs);
    }
  })
});

/*  "/api/point_crimepull"
 *    POST: finds all crimes within the passed in radius of
 *          the passed in lat,lng pair that happened after the
 *          passed in year
 */
app.post("/api/point_crimepull", function(req, res) {
  if (!req.body.lat || !req.body.lng) {
    handleError(res, "Invalid user input", 
      "Must provide valid latitude and longitude coordinates.", 400);
  }
  var radius;
  var year;
  var lat = parseFloat(req.body.lat);
  var long = parseFloat(req.body.lng);
  if (!req.body.radius) {
    radius = 400;
  } else {
    radius = parseFloat(req.body.radius);
  }
  if (!req.body.year) {
    year = "2000-01-01T00:00:00Z";
  } else {
    year = req.body.year + "-01-01T00:00:00Z";
  }

  var query = {
    Timestamp: {
      $gte: new Date(year)
    },
    Coordinates: {
      $geoWithin: {
        $centerSphere: [[long,lat], radius/R]
      }
    }
  };

  db.collection(ATL_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get crimes");
    } else {
      res.status(200).json(docs);
    }
  });
});

/*  "/api/route_crimepull"
 *    POST: finds all crimes within the passed in radius of
 *          the passed in route defined by lat,lng pairs that
 *          happened after the passed in year
 */
app.post("/api/route_crimepull", function(req, res) {
  if (!req.body.points) {
    handleError(res, "Invalid user input", 
      "Must provide valid latitude and longitude coordinates.", 400);
  }
  var points = req.body.points;
  var radius;
  var year;
  if (points.length < 4) {
    handleError(res, "Invalid user input",
      "Must provide an array of at least 2 latitude and longitude coordinates.", 400);
  }
  if (!req.body.radius) {
    radius = 400;
  } else {
    radius = parseFloat(req.body.radius);
  }
  if (!req.body.year) {
    year = "2000-01-01T00:00:00Z";
  } else {
    year = req.body.year + "-01-01T00:00:00Z";
  }
  var query = {
    Timestamp: {
      $gte: new Date(year)
    }
  }
  for (x = 3; x < points.length; x+=2) {
    var lat1 = parseFloat(points[x-3]);
    var long1 = parseFloat(points[x-2]);
    var lat2 = parseFloat(points[x-1]);
    var long2 = parseFloat(points[x]);

    var brng1 = bearing(lat2,long2,lat1,long1);
    var brng2 = bearing(lat1,long1,lat2,long2);  
    
    var topLat1 = cornerLat(lat1, radius, brng1+90);
    var topLong1 = cornerLong(lat1, long1, radius, brng1+90);
    var botLat1 = cornerLat(lat1, radius, brng1-90);
    var botLong1 = cornerLong(lat1, long1, radius, brng1-90);
    var topLat2 = cornerLat(lat2, radius, brng2+90);
    var topLong2 = cornerLong(lat2, long2, radius, brng2+90);
    var botLat2 = cornerLat(lat2, radius, brng2-90);
    var botLong2 = cornerLong(lat2, long2, radius, brng2-90);

    if (!query.$or) {
      query.$or = [
        {
          Coordinates: {
            $geoWithin: {
              $geometry: {
                type: "Polygon",
                coordinates: [[
                  [botLong1,botLat1],
                  [topLong1,topLat1],
                  [botLong2,botLat2],
                  [topLong2,topLat2],
                  [botLong1,botLat1]
                ]]
              }
            }
          }
        },
        {
          Coordinates: {
            $geoWithin: {
              $centerSphere: [[long1,lat1], radius/R]
            }
          }
        },
        {
          Coordinates: {
            $geoWithin: {
              $centerSphere: [[long2,lat2], radius/R]
            }
          }
        }
      ]
    } else {
      query.$or.push({
        Coordinates: {
          $geoWithin: {
            $geometry: {
              type: "Polygon",
              coordinates: [[
                [botLong1,botLat1],
                [topLong1,topLat1],
                [botLong2,botLat2],
                [topLong2,topLat2],
                [botLong1,botLat1]
              ]]
            }
          }
        }
      });
      query.$or.push({
        Coordinates: {
          $geoWithin: {
            $centerSphere: [[long2,lat2], radius/R]
          }
        }
      });
    }
  }
  db.collection(ATL_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get crimes");
    } else {
      res.status(200).json(docs);
    }
  });
});

/*  "/api/crimes/:id"
 *    GET: find crime by id
 *    PUT: update crime by id
 *    DELETE: deletes crime by id
 */

app.get("/api/crimes/:id", function(req, res) {
  db.collection(ATL_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res,err.message, "Failed to get crime");
    } else { 
      res.status(200).json(doc);
    }
  });
});

app.put("/api/crimes/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(ATL_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update crime");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/crimes/:id", function(req, res) {
  db.collection(ATL_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      throw err;
      handleError(res, err.message, "Failed to delete crime");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

app.get("/api/crimes/:longitude/:latitude/:radius/:year", function(req, res) {
  var lat = parseFloat(req.params.latitude);
  var long = parseFloat(req.params.longitude);
  var radius = parseFloat(req.params.radius);
  var year = req.params.year;
  year += "-01-01T00:00:00Z";

  var query = {
    Timestamp: {
      $gte: new Date(year)
    },
    Coordinates: {
      $geoWithin: {
        $centerSphere: [[long,lat], radius/R]
      }
    }
  };
  db.collection(ATL_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get crimes");
    } else {
      res.status(200).json(docs);
    }
  })
});

app.get("/api/crimes/:long1/:lat1/:long2/:lat2/:radius/:year", function(req, res) {
  var lat1 = parseFloat(req.params.lat1);
  var long1 = parseFloat(req.params.long1);
  var lat2 = parseFloat(req.params.lat2);
  var long2 = parseFloat(req.params.long2);
  var radius = parseFloat(req.params.radius);
  var year = req.params.year;
  year += "-01-01T00:00:00Z";

  var brng1 = bearing(lat2,long2,lat1,long1);
  var brng2 = bearing(lat1,long1,lat2,long2);  

  var topLat1 = cornerLat(lat1, radius, brng1+90);
  var topLong1 = cornerLong(lat1, long1, radius, brng1+90);
  var botLat1 = cornerLat(lat1, radius, brng1-90);
  var botLong1 = cornerLong(lat1, long1, radius, brng1-90);
  var topLat2 = cornerLat(lat2, radius, brng2+90);
  var topLong2 = cornerLong(lat2, long2, radius, brng2+90);
  var botLat2 = cornerLat(lat2, radius, brng2-90);
  var botLong2 = cornerLong(lat2, long2, radius, brng2-90);



  var query = {
    Timestamp: {
      $gte: new Date(year)
    },
    $or: [
      {
        Coordinates: {
          $geoWithin: {
            $geometry: {
              type: "Polygon",
              coordinates: [[
                [botLong1,botLat1],
                [topLong1,topLat1],
                [botLong2,botLat2],
                [topLong2,topLat2],
                [botLong1,botLat1]
              ]]
            }
          }
        }
      },
      {
        Coordinates: {
          $geoWithin: {
            $centerSphere: [[long1,lat1], radius/R]
          }
        }
      },
      {
        Coordinates: {
          $geoWithin: {
            $centerSphere: [[long2,lat2], radius/R]
          }
        }
      }
    ]
  };
  db.collection(ATL_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get crimes");
    } else {
      res.status(200).json(docs);
    }
  })
});

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function bearing(lat1,long1,lat2,long2) {
  var y = Math.sin(toRadians(long2-long1)) * Math.cos(toRadians(lat2));
  var x = Math.cos(toRadians(lat1))*Math.sin(toRadians(lat2)) -
          Math.sin(toRadians(lat1))*Math.cos(toRadians(lat2))*Math.cos(toRadians(long2-long1));
  return toDegrees(Math.atan2(y, x));
}

function cornerLat(lat, radius, brng) {
  return toDegrees(Math.asin( Math.sin(toRadians(lat))*Math.cos(radius/R) +
  Math.cos(toRadians(lat))*Math.sin(radius/R)*Math.cos(toRadians(brng))));
}

function cornerLong(lat, long, radius, brng) {
  return long + toDegrees(Math.atan2(Math.sin(toRadians(brng))*Math.sin(radius/R)*Math.cos(toRadians(lat)),
  Math.cos(radius/R)-Math.sin(toRadians(lat))*Math.sin(toRadians(cornerLat(lat, radius, brng)))));
}