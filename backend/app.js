const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const AppError = require("./utils/appError");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//security
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// & importing the routes from the userRoutes and placeRoutes:
const userRoutes = require("./routes/userRoutes");
const placeRoutes = require("./routes/placeRoutes");


const app = express();
app.enable("trust proxy");

app.use(
  cors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());

app.use(morgan("dev")); // * type of request , status code , time taken, size
app.use(express.json()); // * reading data from the body into req.body //access the response body //body-parser
app.use(express.urlencoded({ extended: true }));

app.options("*", cors());

//serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(express.static("public"));

// reading static files

// securing http headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// using body parser
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// * add all form values to a body object
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//data sanitization against NOSQL query injection
// filtering out all the dollar signs // "email": { "$gt": "" }
app.use(mongoSanitize());

//data sanitization against xss attacks
// html symbols
app.use(xss());

// Custom Middleware
app.use((req, res, next) => {
  let requestTime = new Date(Date.now()).toLocaleString();
  console.log("time", requestTime);
  //console.log("headers", req.headers);
  console.log("cookiesssss", req.cookies);

  next(); // Pass control to the next middleware
});

// * preventing any attacker from using the user's password with brute force attacking from the same address IP
const limiter = rateLimit({
  // ! how many requests per ip we're going to allow
  windowMs: 60 * 60 * 1000, // 1 hour //time window 100 request per 1 hour
  max: 100,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter); // * limit the access to our api route // apply this limiter only to /api and will affects all of the routes that start with /api

// const userRouter = express.Router() // * creating a router so to use it for each resource
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
// *** product , order , reviews , payments routes


// * handling undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server !`, 404));
});

// * handling errors with express:
app.use((err, req, res, next) => {
  console.log(err.stack); // ! showing us the error and where the error is

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
});

// * connecting to the database:
const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to DATABASE");
  })
  .catch(err => {
    console.error("Error connecting to the database", err);
  });


module.exports = app;
