// config/db.js
const mongoose = require('mongoose');

/**
 * @desc Establishes a connection to the MongoDB database.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the URI from environment variables.
    // In Mongoose 6+, options like useNewUrlParser are default and no longer needed.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message with the host name upon successful connection.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // If an error occurs during connection, log the error message.
    console.error(`[DATABASE] Error: ${err.message}`);
    // Exit the Node.js process with a failure code (1).
    process.exit(1);
  }
};

module.exports = connectDB;
