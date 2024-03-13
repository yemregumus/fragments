// src/routes/api/put.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const contentType = require('content-type');

/**
 * Allows the authenticated user to update the data for their existing fragment with the specified id.
 * The client puts a file (raw binary data) in the body of the request
 * and it gets updates if the content-type of this new data is the same as the old one
 */
module.exports = async (req, res) => {
  logger.debug('Trying to update a fragment // PUT v1/fragments/:id');
  const { type } = contentType.parse(req);
  const fragmentData = req.body;

  // If the type of new fragment data does not match current fragment's data type, throw an error
  try {
    // Getting fragment metadata
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, `Read fragment metadata for user ${req.user}`);
    if (fragment.type != type) {
      logger.warn(
        `Content type ${type} passed in PUT v1/fragments/:id doesn't match original content-type`
      );
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            `Type ${type} is not allowed for this fragment. Fragment's type can not be changed after it is created`
          )
        );
    }
    logger.info('Updating fragment data');
    // overwrite fragment data and save updates
    await fragment.setData(fragmentData);
    await fragment.save();
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, err));
  }
};
