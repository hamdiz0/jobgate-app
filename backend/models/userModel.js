const mongoose = require("mongoose");
const validator = require("validator"); //npm i validator
const bcrypt = require("bcryptjs"); // npm i bcryptjs
const crypto = require("crypto"); // build-in node

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "a user must have a name"],
      trim: true,
      maxlength: [30, "a name must not surpass 10 characters"],
    },

    email: {
      type: String,
      required: [true, " a user must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, " please enter a correct email"],
    },

    photo: { type: String },

    password: {
      type: String,
      required: [true, " a user must have a password"],
      minlength: [5, "password is too short , must be over 5 characters long"],
      maxlength: [50, "password too long , must be >= 10"],
      select: false,
    },

    passwordConfirm: {
      // the same as the password needs to be
      type: String,
      required: [true, "veuillez confirmez votre mot de passe"],
      validate: {
        //! this only works on .CREATE() and .SAVE() !! whenever we want to update the user we must user .save() in order to run this validator again  unlike the room where we have findbyidandupdate
        //! new User({ "name" :"iheb", "email" : "agdz"}).save()  or await User.create(req.body)
        validator: function (passwordConfirm) {
          // current element : passwordConfirm
          return this.password === passwordConfirm;
        },
        message: " passwords do not match ",
      },
    },

    role: {
      type: String,
      enum: ["user", "admin", "sous-admin"],
      default: "user",
    },

    passwordChangedAt: {
      type: Date,
    },

    resetToken: {
      type: String,
      required: false,
    },
    
    passwordResetToken: { type: String },

    passwordResetExpires: { type: Date },

    // createdAt: {
    //   type: Date,
    //   default: new Date(Date.now()).toLocaleString(),

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },

  { timestamps: true } //createdAt : updatedAt :
);

//^ 1 :document middleware:
// crypting the password only on save and create when the documnt is being processed
userSchema.pre("save", async function (next) {
  // ! we use the pre('save') to encrypt is between the moment that we receive the data and the moment the data is stored in the database

  //? only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //? hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //* encrypt the original password

  //? delete passwordConfirm field
  this.passwordConfirm = undefined; //& the passwordConfirm won't be returned to the user // won't be outputed // won't be persisted in the db // only needed as a validator

  next();
});

// ! 2 :instance method : a method that is gonna be available on all documents of a collection (user document)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // * returns true if the passwords are the same or false if not
};

// ! 5 order doesn't matter : just middlewares together : update the passwordChangedAt property :
userSchema.pre("save", async function (next) {
  //before a new document is saved in the database

  // ^ we only want it when the password is modified or is new so if not modified return and hit next()
  if (!this.isModified("password") || this.isNew) return next(); // ! this.isNew : the document is new means the password did not change because it is new

  this.passwordChangedAt = Date.now() - 1000; //to compare it with the jwt timestamp bech tji 9balha

  next();
});

// ! 6 query middleware :
//finding only the active users
// & every query that starts with find : findById , findByIdAndUpdate, ....
userSchema.pre(/^find/, function (next) {
  // ^ this points to the current query : .find()
  //^ we only want to find documents which have the property active is true
  this.find({ active: { $ne: false } }); // ! $ne : not equal to // ! active : true
  next();
});

//& 3 : pass in the jwt timestamp : issuedAt , expiresAt in the decode
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //when the token was issued

  //*  by default false : means that user did not change his password
  if (this.passwordChangedAt) {
    // & if passwordChangedAt exists only then we wanna do the comparaison
    // console.log(this.passwordChangedAt)
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); //convert to ms and compare them
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false; //user did not modify after logging in // after the token was issued
};

// & 4 : create a password reset token
userSchema.methods.createPasswordResetToken = function () {
  // ! this token is what we're gonna send to the user it is like a reset password that the user can then use to create a real new password
  const resetToken = crypto.randomBytes(4).toString("hex");
  //number of characters //hexadecimal

  //* encrypting the token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  //  {
  //    resetToken: '19522762c3decb82a48fe8007edea133c6e9da286f532c9fb0641782a012e4b6'
  //  } a30c05bc90faf65809c9d03b6b2311fe60257e27fe65550d7ed6c6ae10779e02  // ^this should be in the database

  this.passwordResetExpires = Date.now() + 20 * 60 * 1000; // for 20 minutes

  //* saving this reset token by creating a new field in our database schema:
  // passwordResetToken: String,
  // passwordResetExpires: Date

  //* return the plain text token : the one we're gonna send via email
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
