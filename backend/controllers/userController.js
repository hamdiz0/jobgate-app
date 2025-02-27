const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("../controllers/handlerFactory");
const APIFeatures = require("./../utils/apiFeatures");

const multer = require("multer");
const sharp = require("sharp");

// Multer setup for memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const coverFilename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${coverFilename}`);

  req.body.photo = `http://127.0.0.1:${process.env.PORT}/img/users/${coverFilename}`;
  next();
});

// & filter object method to allow only specific fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });

  next();
});

// ****** updated
/// updating the currently logged in user's information
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates.", 400));
  }

  const filteredBody = filterObj(req.body, "name", "email", "photo");
  if (req.file) filteredBody.photo = req.body.photo;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.isValidResetToken = catchAsync(async (req, res, next) => {
  const token = req.params.resetToken;
  const user = await User.findOne({
    resetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or has expired",
    });
  }

  res.status(200).json({
    status: "success",
    isExist: true,
    user,
  });
});

// & get my data : logged in user's data
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

// & set the account to inactive : not actually deleting it so the user in some point in the future reactivate his account :
exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log("user", req.user);
  const account = await User.findByIdAndUpdate(req.user.id, { active: false }); // * data that we want to update

  if (!account) {
    return next(new AppError("user not found", 404));
  }

  res.status(204).json({
    status: "success",
    message: "account deactivated",
    data: null,
  });
});

//getting all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });

  next();
});

// ! BY AN ADMIN :

// & creating a user :
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

// ! not for updating user's password with this route

// & updating a user:
exports.updateUser = factory.updateOne(User);

// & deleting a user:
exports.deleteUser = factory.deleteOne(User);