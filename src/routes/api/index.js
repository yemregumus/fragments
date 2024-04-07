// src/routes/api/index.js

const express = require('express');
const logger = require('../../logger');

// Create a router on which to mount our API endpoints
const router = express.Router();

const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

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
      logger.debug('Type after parse: ' + type);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
// POST /v1/fragments
router.post('/fragments', rawBody(), require('./post'));

// GET routes
router.get('/fragments', require('./get'));
router.get('/fragments/:id', require('./getById'));
router.get('/fragments/:id/info', require('./getByIdInfo'));

// DELETE route
router.delete('/fragments/:id', require('./delete'));

// PUT route
router.put('/fragments/:id', rawBody(), require('./put'));

module.exports = router;
