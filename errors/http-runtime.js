module.exports = class extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} statusDesc
   * @param {any[]} params
   */
  constructor(message, statusCode, statusDesc, ...params) {
    super(message, ...params);
    Object.assign(this, {statusCode, statusDesc});
  }
};
