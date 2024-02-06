// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id = randomUUID(), ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('Missing ownerId or type arguments');
    }

    if (typeof size !== 'number' || size < 0) {
      throw new Error("Size isn't a non-negative number");
    }

    const supportedTypes = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'text/*',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];

    if (!supportedTypes.includes(type)) {
      throw new Error('Unsupported type.');
    }

    this.id = id;
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // TODO
    try {
      if (listFragments(ownerId, expand) == undefined) throw 'No owner found';
      const frags = await listFragments(ownerId, expand);
      if (expand) {
        return frags.map((fragment) => new Fragment(fragment));
      } else {
        return frags;
      }
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    try {
      if ((await readFragment(ownerId, id)) == undefined) throw 'No fragment found';
      return await readFragment(ownerId, id);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    // TODO
    try {
      if (readFragment(ownerId, id) == undefined) throw 'No fragment found';
      return deleteFragment(ownerId, id);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    // TODO
    try {
      if (readFragment(this.ownerId, this.id) == undefined) throw 'No fragment found';
      this.updated = new Date().toISOString();
      return writeFragment(this);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    // TODO
    try {
      if (readFragment(this.ownerId, this.id) == undefined) throw 'No fragment found';
      return readFragmentData(this.ownerId, this.id);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // TODO
    try {
      if (readFragment(this.ownerId, this.id) == undefined) throw 'No fragment found';
      this.updated = new Date().toISOString();
      this.size = Buffer.from(data).length;
      return writeFragmentData(this.ownerId, this.id, data);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
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
    // TODO
    const supportedTextTypes = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'text/*',
    ];
    return supportedTextTypes.includes(this.mimeType);
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // TODO
    const { type } = contentType.parse(this.type);
    return [type];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // TODO
    const supportedTypes = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'text/*',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];
    return supportedTypes.includes(value);
  }
}

module.exports.Fragment = Fragment;
