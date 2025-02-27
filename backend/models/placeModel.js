const mongoose = require("mongoose");
const slugify = require("slugify");

const placeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "une place doit avoir un nom"],
      trim: true,
      maxlength: [30, "un nom ne doit pas dépasser 10 characteres"],
    },

    address: {
      type: String,
      //required: [true, "champs necessaire"],
    },

    type: {
      type: String,
      enum: ["r+1", "r+2", "r+3", "terrain vide"],
      required: [true, "champs nécessaire"],
    },

    startDates: [Date],

    description: {
      type: String,
      trim: true,
    },

    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      city: String, // Add city field
      region: String, // Add region (governorate) field
      country: String, // Add country field
    },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "a place must be created by someone"],
    },

    isAwaited: {
      type: Boolean,
      default: false,
    },

    // Add the slug field to the schema
    slug: {
      type: String,
      unique: true, // Ensure slugs are unique
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Pre-save middleware to generate and set the slug
placeSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    // Generate a slug from the name
    const nameSlug = slugify(this.name, { lower: true });
    const uniqueId = this._id.toString().substring(18, 24);
    // Combine the slug and the unique ID portion for uniqueness
    this.slug = `${nameSlug}-${uniqueId}`;
  }
  next();
});

// Query middleware
placeSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// Populating each document with the query middleware
placeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: " -__v -passwordChangedAt",
  });

  next();
});

// Performance optimization with indexes
placeSchema.index({ location: "2dsphere" });

// Document middleware to validate uniqueness before saving
placeSchema.pre("save", async function (next) {
  if (this.isModified()) {
    const existingPlace = await Place.findOne({
      name: this.name,
      address: this.address,
      type: this.type,
      createdBy: this.createdBy,
    });

    if (existingPlace) {
      const error = new Error(
        "A place with the same name, address, and type already exists for this user. Try updating it "
      );
      return next(error);
    }
  }

  next();
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;