const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// * importing app
const app = require("./app");

// * handling uncaught exceptions : handling any x that are out of places : ex : if we put a instead of b in any line of code it will get unhandled reference !
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaught exception!! SHUTTING DOWN!!");
  process.exit(1);
});

let port = process.env.PORT ||  3000 ;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(process.env.DATABASE)
});

// * handling unhandled rejected promises :
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled rejection !! SHUTTING DOWN !!");
  server.close(() => process.exit(1));
});