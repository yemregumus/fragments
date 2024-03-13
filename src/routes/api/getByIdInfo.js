// src/routes/api/getByIdInfo.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
/**
 * Gets an authenticated user's fragment metadata with the given id
 */
module.exports = async (req, res) => {
  try {
    logger.info('Trying to get user fragment metadata by id // GET /v1/fragments/:id/info');
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(`Read fragment metadata for user ${req.user}`);
    logger.debug({ fragment });
    return res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, err));
  }
};
