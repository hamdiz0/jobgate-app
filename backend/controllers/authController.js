const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const crypto = require("crypto");

//signin the token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//send token function
const createSendToken = (user, statusCode, res, resetToken = "") => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//signup:
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Send welcome email
  await sendEmail({
    email: newUser.email,
    subject: "Welcome to our platform! 🎉🙏",
    html: `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <div style="background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #333; text-align: center;">Welcome to Our Platform ${newUser.name} </h1>
            <p style="color: #666; text-align: center; font-size: 16px;">Thank you for signing up! We're excited to have you on board.</p>
            <p>  If you need any help ,please don't hesitate to contact me!
            Aziz Ouachem , CEO </p>
            </div>
        
    </div>
</body>`,
  });

  createSendToken(newUser, 201, res);
});

// login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // ! 1 check if email and password exist :

  if (!email || !password) {
    return next(new AppError("please provide an email and a password", 400));
  }

  // ! 2 check if the user exists && password is correct :

  // * finding user by email
  const user = await User.findOne({ email: email }).select("+password"); //req.body.email // ! we need to select the password from the database cuz we did select :false //! if we want the field that by default not selected we add '+' in front of the field's name
  // user = user document is the result of a query
  console.log(user);

  // * if the user doesn't exist then this line of code won't run
  if (!user || !(await user.correctPassword(password, user.password))) {
    //user's password field
    return next(new AppError("incorrect email or password", 401));
  }

  // ! 3 if everything is ok , send the token back to the client
  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  //const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  //expiresIn: process.env.JWT_EXPIRES_IN,
  // });
});

//logout
exports.logout = catchAsync(async (req, res, next) => {
  // ! 1 sending a cookie with the token that expires immediately
  res.cookie("jwt", "logged Out", {
    // * same name as the jwt from before
    expires: new Date(Date.now() + 5 * 1000), //^ expires after 10 seconds
    // httpOnly: true, //^ cannot be accessed or modified by any browser
  });

  // ! 2 sending the response
  res.status(200).json({
    status: "success",
  });
});

// check if the user is logged in
// * protect the route only for if logged in
exports.checkLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// * restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user', "sous admin"]. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

//^ reset password functionality :
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;

  const message = `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
  <div style="background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
          <p style="color: #666; text-align: center; font-size: 16px;">You have requested a password reset.</p>
          <p style="text-align: center; color: #007bff ;font-size: 16px; margin-top: 20px;">${resetToken} to reset your password.</p>
      </div>
  </div>
</body> `;

  try {
    // Password Reset Email Template
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    const updateUser = await User.findByIdAndUpdate(user._id, {
      $set: { resetToken: resetToken },
    });

    console.log(updateUser);
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
      resetToken: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT

  createSendToken(user, 201, res);
});

// // updating the currently logged in user's password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
