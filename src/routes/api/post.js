// src/routes/api/get.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');

const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

const generateUUID = () => {
  return crypto.randomUUID().toString('hex');
};

module.exports = (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    const id = generateUUID();
    const location = req.protocol + '://' + req.hostname + ':8080/v1' + req.url + '/' + id;
    res.set({ Location: location });

    const newFragment = new Fragment({
      ownerId: crypto.createHash('sha256').update(req.user).digest('hex'),
      created: new Date().toString(),
      update: new Date().toString(),
      type: req.headers['content-type'],
      size: Number(req.headers['content-length']),
    });
    newFragment.setData(req.body);

    createSuccessResponse(
      res.status(201).json({
        status: 'ok',
        fragments: newFragment,
      })
    );
  } else {
    createErrorResponse(
      res.status(415).json({
        message: 'Invalid file type',
      })
    );
  }
};
