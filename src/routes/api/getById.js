// src/routes/api/getById.js

const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const mime = require('mime');
const path = require('node:path');
/**
 * Gets an authenticated user's fragment data (i.e., raw binary data) with the given id
 */
module.exports = async (req, res) => {
  try {
    logger.info('Trying to get user fragment by id // GET /v1/fragments/:id');
    //Logic to account for GET /fragments/:id.ext
    const parsedPath = path.parse(req.url);
    const id = parsedPath.name;
    const ext = parsedPath.ext;

    // Getting fragment metadata
    const fragment = await Fragment.byId(req.user, id);
    logger.debug({ fragment }, `Read fragment metadata for user ${req.user}`);
    // Getting fragment data
    let fragmentData = await fragment.getData();
    let fragmentType = fragment.type;
    let fragmentDataSize = fragment.size;

    logger.info('Fragment data is successfully read');
    logger.debug(`Fragment type ` + fragmentType);
    logger.debug(`Fragment size ` + fragmentDataSize);

    // When id string actually gets parsed into 2 elements, we should see if the fragment data can be converted
    // into the required datatype
    if (ext) {
      logger.info(
        `User ${req.user} requested conversion of fragment from ${fragmentType} to ${ext}`
      );
      // If conversion is allowed
      if (Fragment.isValidConversion(fragmentType, ext)) {
        logger.debug('Conversion is allowed. Initiating conversion process');
        fragmentData = await fragment.convertFragmentData(ext);
        logger.debug(fragmentData);
        fragmentType = mime.getType(ext);
        logger.debug(`Converted to ${ext}, returning fragment type ${fragmentType}`);
      } else {
        const err = `${ext} is not a valid extension for a fragment with type ${fragmentType}`;
        logger.error(err);
        return res.status(415).json(createErrorResponse(415, err));
      }
    }

    // set Content-type and Content-Length in response header
    return res
      .set('content-type', fragmentType)
      .set('content-length', fragmentDataSize)
      .status(200)
      .send(fragmentData);
  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, err));
  }
};
