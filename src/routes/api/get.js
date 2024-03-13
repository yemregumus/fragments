// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  let fragments = [];
  // If there is a query in the get request, making sure to pass expand parameter as true
  // This way it will return metadata for each fragment
  try {
    if (req.query.expand) {
      fragments = await Fragment.byUser(req.user, true);
      logger.info(`User ${req.user} requested detailed fragments list`);
      logger.debug({ fragments });
    } else {
      // Otherwise returning a list of fragments ids
      fragments = await Fragment.byUser(req.user);
      logger.info(`User ${req.user} requested list of fragments ids`);
      logger.debug({ fragments });
    }
  } catch (err) {
    logger.error(err, 'Got an error in GET /v1/fragments request');
    return res.status(500).json(createErrorResponse(500, err));
  }
  res.status(200).json(createSuccessResponse({ fragments: fragments }));
};
