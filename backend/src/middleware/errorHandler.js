/**
 * Centralized Error Handling Middleware
 * Gracefully captures operational and unexpected errors, providing friendly feedback for MySQL constraint violations.
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // MySQL Foreign Key Constraint Violation on Deletion (RESTRICT)
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete or alter this record because related history records depend on it (Foreign Key RESTRICT).'
    });
  }

  // MySQL Duplicate Entry (UNIQUE constraint violation)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record with this unique field (email, phone, license, or registration) already exists.'
    });
  }

  // MySQL Foreign Key Not Found on Insert/Update
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced foreign record does not exist.'
    });
  }

  // MySQL CHECK constraint violation
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({
      success: false,
      message: 'Data check constraint violated (e.g., distance must be > 0, rating between 1 and 5).'
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  errorHandler
};
