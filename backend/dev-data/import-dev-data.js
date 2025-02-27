const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Place = require("./../models/placeModel");
const User = require("./../models/userModel");


dotenv.config({ path: "./../config.env" });

// * importing app
const app = require("./../app");

// READ JSON FILE

const places = JSON.parse(fs.readFileSync(`${__dirname}/places.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Place.create(places);
    await User.create(users, { validateBeforeSave: false });
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// * deleting all data from collection:
const deleteData = async () => {
  try {
    // await Review.deleteMany()
    await Place.deleteMany();
    // await User.deleteMany()
    await User.deleteMany();

    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit(); //exiting
};

if (process.argv[2] === "--import") {
  console.log("DATABASE URI:", process.env.DATABASE)
  importData();
} else if (process.argv[2] === "--delete") {
  console.log("DATABASE URI:", process.env.DATABASE)
  deleteData();
}
