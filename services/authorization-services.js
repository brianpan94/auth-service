const jwt = require('jsonwebtoken');
const {TOKEN_SECRET, TOKEN_EXPIRE_TIME} = process.env;

module.exports = class Authorization {
  /**
   * Generate your token
   * @param {*} data Give it an userID it can make a token for you.
   */
  async tokenGenerate(data) {
    const token = jwt.sign(data, TOKEN_SECRET, {expiresIn: TOKEN_EXPIRE_TIME});
    return token;
  }
  /**
   * Verify your token
   * @param {string} token The token you want to verify.
   * @param {boolean?} withVerify 是否需要驗證(預設true，設為false將不驗證token
   *                              是否有效)
   */
  async tokenDecode(token, withVerify = false) {
    const decodedToken =
      jwt[withVerify ? 'verify' : 'decode'](token, TOKEN_SECRET);
    return decodedToken;
  }
};
