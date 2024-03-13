// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
// Use https://github.com/markdown-it/markdown-it to help with text conversions to markdown
const MarkdownIt = require('markdown-it');
// Use https://sharp.pixelplumbing.com to help with image conversions
const sharp = require('sharp');

const md = new MarkdownIt();

// Functions for working with fragment metadata/data using DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

// Dictionary of conversions
const CONVERSIONS = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md', '.html', '.txt'],
  'text/html': ['.html', '.txt'],
  'application/json': ['.json', '.txt'],
  'image/jpeg': ['.png', '.jpg', '.webp', '.gif'],
  'image/png': ['.png', '.jpg', '.webp', '.gif'],
  'image/webp': ['.png', '.jpg', '.webp', '.gif'],
  'image/gif': ['.png', '.jpg', '.webp', '.gif'],
};

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // Throw if no owner ID or no fragment type was found at object creation
    if (!ownerId || !type) {
      throw new Error('Owner ID and type are required to create a fragment');
    }
    // Throw an error if any other type is being passed
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`${type} is not supported`);
    }
    // Account for invalid size variable
    if (typeof size != 'number' || size < 0) {
      throw new Error('Size must be a positive number');
    }

    // generate random id for a newly created fragment
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.size = size || 0;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Could not locate a fragment with id: ${id}`);
    }
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    // update the date of the latest update of a fragment
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    this.updated = new Date().toISOString();
    this.size = Buffer.byteLength(data);
    this.save(); // saving updated metadata, so that db gets updated
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    // check fragment's type against regular expression
    const regex = new RegExp('^text/*');
    return regex.test(this.type);
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const formats = ['text/plain', 'application/json'];
    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // check the type against regular expression
    const regex = new RegExp('^(text/*|application/json/*|image/*)');
    return regex.test(value);
  }

  /**
   * Returns true if we know that current fragment data can be converted into suggested extension
   * @param {string} ext an extension
   * @returns {boolean} true if we conversion can be done
   */
  static isValidConversion(type, ext) {
    // get a list of allowed extensions for the fragment type
    const extensions = CONVERSIONS[type];
    return extensions.includes(ext);
  }

  /**
   * Returns fragment data after it has been converted into suggested extension
   * @param {string} ext an extension
   * @returns converted data
   * To be used after a call to isValidConversion() because it doesn't check again if the current content-type can be converted
   */
  async convertFragmentData(ext) {
    let convertedData;
    const data = await this.getData();
    if (ext == '.png') {
      convertedData = await sharp(data).png().toBuffer();
    } else if (ext == '.jpeg' || ext == '.jpg') {
      convertedData = await sharp(data).jpeg().toBuffer();
    } else if (ext == '.webp') {
      convertedData = await sharp(data).webp().toBuffer();
    } else if (ext == '.gif') {
      convertedData = await sharp(data).gif().toBuffer();
    } else if (ext === '.html' && this.mimeType == 'text/markdown') {
      convertedData = md.render(data.toString());
    } else if (ext === '.json') {
      convertedData = JSON.stringify(data);
    } else {
      convertedData = data.toString();
    }
    return convertedData;
  }
}

module.exports.Fragment = Fragment;
module.exports.CONVERSIONS = CONVERSIONS;
