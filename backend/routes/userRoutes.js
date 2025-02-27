const express = require("express");
const multer = require("multer");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

//const multer = require("multer"); //npm i multer

const router = express.Router();

// & login and sign up routes :
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

//route for getting the current user's data
router.get(
  "/me",
  authController.checkLoggedIn,
  userController.getMe,
  userController.getUser
);

// route for updating the currently logged in user's password
router.patch(
  "/updateMyPassword",
  authController.checkLoggedIn,
  authController.updatePassword
);

// updating the logged in user's info
router.patch(
  "/updateMe",
  authController.checkLoggedIn,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

//deleting the logged in user
router.delete(
  "/deleteMe",
  authController.checkLoggedIn,
  userController.deleteMe
);

// BY AN ADMIN and SOUS ADMIN

router
  .route("/")
  .get(
    authController.checkLoggedIn,
    authController.restrictTo("admin", "sous-admin"),
    userController.getAllUsers
  )
  .post(
    authController.checkLoggedIn,
    authController.restrictTo("admin", "sous-admin"),
    userController.createUser
  );

router.route("/valid/:resetToken").get(userController.isValidResetToken);

router
  .route("/:id")
  .get(
    authController.checkLoggedIn,
    authController.restrictTo("admin", "sous-admin"),
    userController.getUser
  )
  .patch(
    authController.checkLoggedIn,
    authController.restrictTo("admin", "sous-admin"),
    userController.updateUser
  )
  .delete(
    authController.checkLoggedIn,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
