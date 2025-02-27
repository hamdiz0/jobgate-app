const Place = require("./../models/placeModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// creating a place
exports.createPlace = catchAsync(async (req, res, next) => {
  const newPlace = await Place.create(req.body);

  res.status(200).json({
    status: "success",
    place: newPlace,
  });
});

// getting all places
exports.getAllPlaces = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(Place.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const places = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: places.length,
    data: {
      places,
    },
  });
});

// updating a place
exports.updatePlace = catchAsync(async (req, res, next) => {
  const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!updatedPlace) {
    return next(new AppError("no place found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      place: updatedPlace,
    },
  });
});

// deleting a place
exports.deletePlace = catchAsync(async (req, res, next) => {
  const deletedPlace = await Place.findByIdAndDelete(req.params.id);

  if (!deletedPlace) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// getting a place
exports.getPlace = catchAsync(async (req, res, next) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    place: place,
  });
});

//get my places
exports.getMyPlaces = catchAsync(async (req, res, next) => {
  const myPlaces = await Place.find({ createdBy: req.user._id });

  res.status(200).json({
    status: "success",
    results: myPlaces.length,
    myPlaces,
  });
});

exports.addToWaitingList = catchAsync(async (req, res, next) => {
  const awaitedPlaces = await Place.find({ isAwaited: true });

  res.status(200).json({
    status: "success",
    results: awaitedPlaces.length,
    awaitedPlaces: awaitedPlaces, // Sending awaitedPlaces as response
  });
});

// get place stats
exports.getPlaceStats = catchAsync(async (req, res, next) => {
  // Parse the start and end dates from the request query
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  // Construct match criteria based on the provided date range
  const matchCriteria = {};
  if (startDate && endDate) {
    matchCriteria.$or = [
      { createdAt: { $gte: new Date(startDate) } },
      { updatedAt: { $lte: new Date(endDate) } },
    ];
  } else if (startDate) {
    matchCriteria.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    matchCriteria.updatedAt = { $lte: new Date(endDate) };
  }

  const pipeline = [
    {
      $match: matchCriteria,
    },
    {
      $project: {
        type: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $group: {
        _id: "$type",
        numberOfPlaces: { $sum: 1 },
        dates: {
          $push: {
            $cond: [
              { $gt: ["$createdAt", "$updatedAt"] },
              "$createdAt",
              "$updatedAt",
            ],
          },
        },
      },
    },
    {
      $sort: { dates: 1 },
    },
  ];

  const stats = await Place.aggregate(pipeline);

  res.status(200).json({
    status: "success",
    data: {
      stats: stats,
    },
  });
});

//calculate the busiest month of the year :
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // Convert year to a number

  // Get distinct types from the database
  const types = await Place.distinct("type");

  // Perform aggregation to get monthly plan
  const plan = await Place.aggregate([
    {
      $match: {
        startDates: { $exists: true, $not: { $size: 0 } }, // Filter documents with non-empty startDates array
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }, // Filter by year
      },
    },
    {
      $project: {
        month: { $month: { $arrayElemAt: ["$startDates", 0] } }, // Extract month from the first startDate
        type: 1, // Include the type field
      },
    },
    {
      $group: {
        _id: { month: "$month", type: "$type" }, // Group by month and type
        numberOfPlacesStarts: { $sum: 1 }, // Count places started in each month for each type
      },
    },
    {
      $group: {
        _id: "$_id.month", // Group by month only
        data: {
          $push: {
            type: "$_id.type",
            numberOfPlacesStarts: "$numberOfPlacesStarts",
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        month: "$_id",
        data: 1,
      },
    },
    {
      $sort: { month: 1 }, // Sort by month in ascending order
    },
  ]);

  // Create an array to hold the final result with all months and types
  const finalResult = [];
  for (let i = 1; i <= 12; i++) {
    const monthData = plan.find((item) => item.month === i);
    if (monthData) {
      finalResult.push({ month: i, data: monthData.data });
    } else {
      finalResult.push({
        month: i,
        data: types.map((type) => ({ type: type, numberOfPlacesStarts: 0 })),
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      plan: finalResult,
    },
  });
});

// get places within radius
exports.getPlacesWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const places = await Place.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: places.length,
    data: {
      data: places,
    },
  });
});

// get distance from a point : ya3ref 9adech b3ida 3lih lpalce
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Place.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
