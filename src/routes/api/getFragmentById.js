// src/routes/api/get.js
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
// const contentType = require('content-type');
/**
 * Get a list of fragments for the current user
 */
// const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

function validConversion(contentType, extension) {
  let formats = [];
  switch (contentType) {
    case 'text/plain':
      formats = ['.txt'];
      break;
    case 'text/markdown':
      formats = ['.md', '.html', '.txt'];
      break;
    case 'text/html':
      formats = ['.html', '.txt'];
      break;
    case 'application/json':
      formats = ['.json', '.txt'];
      break;
    case 'image/png':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    case 'image/jpeg':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    case 'image/webp':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    case 'image/gif':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    default:
      return false;
  }

  const includeExt = (element) => element.includes(extension);

  return formats.some(includeExt);
}

module.exports = async (req, res) => {
  const idWithExt = req.params.id;
  let user;
  try {
    user = crypto.createHash('sha256').update(req.user).digest('hex');
  } catch (error) {
    console.error('Error occurred during user hashing:', error);
    createErrorResponse(
      res.status(500).json({
        message: `Error occurred: ${error.message}`,
      })
    );
    return;
  }

  const idWithExtArray = idWithExt.split('.');

  let id;
  let ext;

  if (idWithExtArray.length > 1) {
    id = idWithExtArray.slice(0, idWithExtArray.length - 1).join('.');
    ext = idWithExtArray[idWithExtArray.length - 1];
  } else {
    id = idWithExtArray[0];
    ext = null;
  }

  let idList;
  try {
    idList = await Fragment.byUser(user);
  } catch (error) {
    console.error('Error occurred while fetching fragment list:', error);
    createErrorResponse(
      res.status(500).json({
        message: `Error occurred: ${error.message}`,
      })
    );
    return;
  }

  if (idList.includes(id)) {
    let fragmentObject;
    try {
      fragmentObject = await Fragment.byId(user, id);
    } catch (error) {
      console.error('Error occurred while fetching fragment by id:', error);
      createErrorResponse(
        res.status(500).json({
          message: `Error occurred: ${error.message}`,
        })
      );
      return;
    }

    let fragment;
    if (fragmentObject instanceof Fragment) {
      fragment = fragmentObject;
    } else {
      fragment = new Fragment({
        id: id,
        ownerId: fragmentObject.ownerId,
        created: fragmentObject.created,
        update: fragmentObject.update,
        type: fragmentObject.type,
        size: fragmentObject.size,
      });
    }

    let dataResult = null;
    if (!ext) {
      try {
        dataResult = await fragment.getData();
      } catch (error) {
        console.error('Error occurred while fetching fragment data:', error);
        createErrorResponse(
          res.status(500).json({
            message: `Error occurred: ${error.message}`,
          })
        );
        return;
      }
    } else {
      if (validConversion(fragment.mimeType, ext)) {
        try {
          dataResult = await fragment.getData();
        } catch (error) {
          console.error('Error occurred while fetching fragment data:', error);
          createErrorResponse(
            res.status(500).json({
              message: `Error occurred: ${error.message}`,
            })
          );
          return;
        }
      }
    }

    if (dataResult) {
      res.setHeader('Content-Type', fragment.mimeType);
      res.status(200).send(dataResult);
    } else {
      const error = 'Conversion is not possible from ' + fragment.mimeType + ' to ' + ext;
      createErrorResponse(
        res.status(415).json({
          code: 415,
          message: error,
        })
      );
    }
  } else {
    createErrorResponse(
      res.status(404).json({
        message: 'Id is not found!',
      })
    );
  }
};
