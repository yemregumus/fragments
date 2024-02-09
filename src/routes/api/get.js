// src/routes/api/get.js
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');

const createSuccessResponse = require('../../response').createSuccessResponse;

module.exports = async (req, res) => {
  const expand = req.query.expand;
  let user = crypto.createHash('sha256').update(req.user).digest('hex');
  const idList = await Fragment.byUser(user);

  if (expand === '1') {
    let fragments = [];

    for (const id of idList) {
      const fragment = await Fragment.byId(user, id);
      if (fragment) {
        fragments.push(fragment);
      }
    }

    createSuccessResponse(
      res.status(200).json({
        status: 'ok',
        fragments: fragments,
      })
    );
  } else {
    createSuccessResponse(
      res.status(200).json({
        status: 'ok',
        fragments: idList,
      })
    );
  }
};
