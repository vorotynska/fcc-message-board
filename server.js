'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db-connection');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const helmet = require("helmet");
const Thread = require("./models/Thread");
const Reply = require("./models/Reply")
const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({
  origin: '*'
})); //For FCC testing purposes only

app.use(
  helmet({
    frameguard: {
      action: "sameorigin"
    },
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://code.jquery.com/jquery-2.2.1.min.js"
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    dnsPrefetchControl: {
      allow: false
    },
    referrerPolicy: {
      policy: "same-origin"
    }
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
//apiRoutes(app);
app.use("/api", apiRoutes)

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});



//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing 

/*require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");
//const connectDB = require("./db/connectDB");
require('./db-connection');
const helmet = require("helmet");
//const xss = require("xss-clean");
const cors = require("cors");
const Thread = require("./models/Thread");
const Reply = require("./models/Reply");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({
  origin: "*"
})); //For FCC testing purposes only
app.use(
  helmet({
    frameguard: {
      action: "sameorigin"
    },
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://code.jquery.com/jquery-2.2.1.min.js"
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    dnsPrefetchControl: {
      allow: false
    },
    referrerPolicy: {
      policy: "same-origin"
    }
  })
);
//app.use(xss());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Sample front-end
app.route("/b/:board/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

//Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
app.use("/api", apiRoutes);
//apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Reply.deleteMany({});
    await Thread.deleteMany({}); // For the purpose of this app we don't care about saving any data, so any time the app connects, all data in the DB will be deleted.
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (e) {
    console.log(e);
  }
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 3500);
  }
};

start();

//const listener = app.listen(process.env.PORT || 3000, function () {
//  console.log('Your app is listening on port ' + listener.address().port);
//  if(process.env.NODE_ENV==='test') {
//    console.log('Running Tests...');
//    setTimeout(function () {
//      try {
//        runner.run();
//      } catch(e) {
//        console.log('Tests are not valid:');
//        console.error(e);
//      }
//    }, 1500);
//  }
//});

module.exports = app; //for testing  */