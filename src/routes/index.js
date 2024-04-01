// src/routes/index.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../src/model/fragment');

const { authenticate } = require('../../src/authorization');

const { version, author } = require('../../package.json');

const { createSuccessResponse } = require('../../src/response');

// Create a router that we can use to mount our API
const router = express.Router();

const { hostname } = require('os');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not,the server isn't healthy.
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/yemregumus/fragments',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );

  // Support sending various Content-Types on the body up to 5M in size
  const rawBody = () =>
    express.raw({
      inflate: true,
      limit: '5mb',
      type: (req) => {
        // See if we can parse this content type. If we can, `req.body` will be
        // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
        // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      },
    });

  // Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
  // You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
  router.post('/v1/fragments', rawBody(), require('./api/post'));
});

module.exports = router;
