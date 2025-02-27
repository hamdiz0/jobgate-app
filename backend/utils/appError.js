class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //from the parent class : Error //inherit the message property from the parent class

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // * converting statusCode to string with template string and if statusCode as a string starts with '4', then it's a fail, otherwise it's an error

    this.isOperational = true; // * stackTrace in app.js //a new field that we made

    Error.captureStackTrace(this, this.constructor); //app error itself //how to send the error
  }
}

module.exports = AppError;
