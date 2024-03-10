// src/routes/api/post.js

const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');

const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

const generateUUID = () => {
  return crypto.randomUUID().toString('hex');
};

module.exports = async (req, res) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      const id = generateUUID();
      const location = req.protocol + '://' + req.hostname + ':8080/v1' + req.url + '/' + id;
      res.set({ Location: location });

      const ownerId = crypto.createHash('sha256').update(req.user).digest('hex');

      const newFragment = new Fragment({
        ownerId: ownerId,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: req.headers['content-type'],
        size: Number(req.headers['content-length']),
      });

      try {
        await newFragment.setData(req.body);
      } catch (error) {
        throw new Error('Error setting fragment data: ' + error.message);
      }

      await newFragment.save();

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
  } catch (error) {
    createErrorResponse(
      res.status(500).json({
        message: 'Error occurred: ' + error.message,
      })
    );
  }
};
