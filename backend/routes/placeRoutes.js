const express = require("express");
const placeController = require("../controllers/placeController");
const authController = require("../controllers/authController");

const router = express.Router();

// ^ route for the aggregation method:
router.route("/places-stats").get(placeController.getPlaceStats);

// ^ route for the aggregation pipeline for the getMonthlyPlan function:
router
  .route("/monthly-plan/:year")
  .get(
    authController.checkLoggedIn,
    authController.restrictTo("admin"),
    placeController.getMonthlyPlan
  );

// finding places within radius
router
  .route(
    "/places-within/:distance/center/:latlng/unit/:unit"
    // center : point whre u live
    // ! pass in the coordinates of where you are
    // /233/center/34.111745,-118.113491/unit/mi
    // find all the places with the distance of 233 miles
  )
  .get(placeController.getPlacesWithin);

//calculating distance
router.route("/distances/:latlng/unit/:unit").get(placeController.getDistances);

//get user's created places
router
  .route("/getMyPlaces")
  .get(authController.checkLoggedIn, placeController.getMyPlaces);

router
  .route("/waitingList")
  .get(authController.checkLoggedIn, placeController.addToWaitingList);

router
  .route("/")
  .get(authController.checkLoggedIn, placeController.getAllPlaces)
  .post(authController.checkLoggedIn, placeController.createPlace);

// BY AN ADMIN and SOUS-ADMIN
router
  .route("/:id")
  .get(authController.checkLoggedIn, placeController.getPlace)
  .patch(authController.checkLoggedIn, placeController.updatePlace)
  .delete(authController.checkLoggedIn, placeController.deletePlace);

module.exports = router;
