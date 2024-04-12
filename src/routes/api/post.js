// src/routes/api/post.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const contentType = require('content-type');
const { URL } = require('url');

/**
 * Creates a new fragment for the user.
 * The client posts a file (raw binary data) in the body of the request
 * and sets the Content-Type header to the desired type of the fragment if the type is supported.
 */
module.exports = async (req, res) => {
  logger.debug('Trying to add a new fragment // POST v1/fragments');
  const { type } = contentType.parse(req);
  const fragmentData = req.body;

  // If the type of a fragment to be created is not currently supported, throw an error
  if (!Fragment.isSupportedType(type)) {
    logger.warn(`Unsupported type ${type} passed in POST v1/fragments`);
    return res.status(415).json(createErrorResponse(415, `Unsupported type ${type} `));
  }

  try {
    // create a new fragment
    const fragment = new Fragment({ ownerId: req.user, type: type });
    logger.info({ fragment }, 'Created new fragment');
    // save created fragment
    await fragment.save();
    // write fragment data
    await fragment.setData(fragmentData, type);

    // If we have API_URL in environment variables, set that (+ fragment id) as a location
    // Otherwise, use localhost (+ fragment id)
    // location header changed
    /*const location = process.env.API_URL
      ? new URL(`${process.env.API_URL}/v1/fragments/${fragment.id}`)
      : new URL(
          `http://fragments-lb-364360123.us-east-1.elb.amazonaws.com:80/v1/fragments/${fragment.id}`
        );*/
    // Dynamically construct the fragment location URL based on the request protocol, host, and fragment ID
    const location = new URL(
      `/v1/fragments/${fragment.id}`,
      req.protocol + '://' + req.get('host')
    );

    logger.debug('Location: ' + location.href);
    console.log('Location: ' + location.href);

    res
      .location(location.href) // Set fragment location in response header
      .status(201)
      .json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    logger.error(err);
    res.status(500).json(createErrorResponse(500, err));
  }
};
