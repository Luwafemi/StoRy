//## indicates my personal notes, may or may not be correct
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");
// const { execPath } = require("process");

//Load config
dotenv.config({ path: "./config/config.env" });
//##this is to initialize dotenv, which provides a path for process.env (environment variables)

//Passport config
require("./config/passport")(passport);

connectDB();

const app = express();

//Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// METHOD OVERRIDE
//  ## Note: Our app hits this method override b4 it hits our http requests (post, get, put, etc) in our routes. In this case, it hits here b4 it hits our router.put() in routes/stories  (line 55).
//  Here, req.body._method (method from the input with [ name='_method' ] in stories/edit.hbs, not the actual form method, which is req.method) is put in a
//  variable called method and then deleted ( variable_method still holds the value and returns it to the caller. Final outcome is [app.use(methodOverride(method)] ). On getting to router.put(),
//  req.body._method returns undefined as it has been deleted. Once we submit the form (stories/edit.hbs), a POST request is encoded in the url (req.method), next, methodOverride does
//  what it has do, changes the request to a PUT (from the returned method). Finally, our app hits the router (router.put()) which now works fine cos a PUT request is available from the client.
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      //look in urlencoded POST bodies and delete it
      let method = req.body._method;
      // console.log(req.method);
      // console.log(req.body._method);
      delete req.body._method;
      return method;
    }
  })
);

//Logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

//Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

//Handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

//Sessions  [must be above Passport middleware]
app.use(
  session({
    secret: "keyboard cat",
    resave: false, //Don't save a session if nothing is modified
    saveUninitialized: false, //Don't create a session until something is stored
    store: new MongoStore({ mongooseConnection: mongoose.connection }), //to store our sessions in our database (When we reset the server, we don't get logged out )
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global variable                      ##we set 'user' as an express global variable here, so we can use it in our handlebars view (stories/index.hbs)
app.use(function (req, res, next) {
  res.locals.user = req.user || null; //## with the passport authentication middleware, we have access to req.user throughout our app (we made this possible in config/passport.js, lines 25 & 28 )
  next();
});

//Static folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;
//##data from .env file(config.env) is loaded into process.env by NODE/OS. So, for process.env.PORT, our application searches for PORT in config.env

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
