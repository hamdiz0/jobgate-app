const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

// & deleting documents
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

// & updating documents
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        documents: doc,
      },
    });
  });

// & creating documents
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(201).json({
      status: "success",
      data: {
        documents: doc,
      },
    });
  });

// & getting documents
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id); // * query is the function //is the query for findingById
    if (populateOptions) query = query.populate(populateOptions); // * if there is a populateOption EX :('review') we wanna populate that query if there is not we do nothing // * popOptions n3eda mba3d as an argument wa9tila exuti function
    const doc = await query; // * finally after manipulating the query we await like we did with pagination and limiting

    // ? same as : findOne({_id:req.params.id })
    // const room = await Room.findById(req.params.id).populate('reviews') // we wanna populate on get one room : to get reviews on one room
    // * .populate({  // getting rid of it here after the query middleware function
    // *     path: 'staff',  //.populate and name of the field that we want to populate
    // *     select: '-__v -passwordChangedAt' // we can also select the fields we want to get back //not in the output
    // * })

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        documents: doc,
      },
    });
  });

// & getting all documents
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.userId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain()
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        documents: doc,
      },
    });
  });
