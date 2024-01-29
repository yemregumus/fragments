// src/routes/api/get.js
const response = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  // Use createSuccessResponse function
  res.status(200).json(
    response.createSuccessResponse({
      status: 'ok',
      fragments: [],
    })
  );
};
