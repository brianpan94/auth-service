const { createClient } = require('redis');
const { REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_DATABASE,
  REDIS_URL,
  CONVERSATION_ID_LIST,
  CONVERSATION_DATA,
  TOKEN_REDIS_EXPIRE_TIME,
} = process.env;
const client = createClient({
  url: REDIS_URL,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  database: REDIS_DATABASE,
});

module.exports = class Redis {
  /**
  * Redis取得連線
  * @return {string} 連線成功會有pong
  */
  async getClient() {
    try {
      await client.ping();
    } catch (e) {
      await client.connect();
    }
    return client;
  }

  /**
  * 取得對話紀錄
  * @async
  * @param {*} field userID
  * @return {Promise<string>} 對話紀錄
  */
  async getIDContext(field) {
    const client = await this.getClient();
    client.select(0);
    const value = await client.hGet(CONVERSATION_DATA, field);
    return value;
  };

  /**
     * 建立conversationID List
     * @async
     * @param {Array} data ID 內容
     */
  async conversationIDSet(data) {
    const client = await this.getClient();
    client.select(0);
    await client.sAdd(CONVERSATION_ID_LIST, data);
    console.log('List create!');
  };

  /**
  * 取得一筆可用conversationID
  * @async
  * @return {Promise<string>} conversationID
  */
  async getOneConversationID() {
    const client = await this.getClient();
    client.select(0);
    const value = await client.sRandMember(CONVERSATION_ID_LIST);
    return value;
  };

  /**
   * verify check
   * @async
   * @param {*} key
   * @param {*} value
   */
  async loginCheck(key) {
    const client = await this.getClient();
    client.select(1);
    return await client.get(key);
  }

  /**
   * 登入資訊儲存
   * @async
   * @param {string} key employeeID-platform
   * @param {object} value token
   * @return {boolean}
   */
  async loginInput(key, value) {
    const client = await this.getClient();
    client.select(1);
    await client.set(key, value);
    await client.expire(key, TOKEN_REDIS_EXPIRE_TIME);
    console.log('Token insert successed');
    return true;
  };

  /**
   * 登出資訊清除
   * @param {string} key employeeID-platform
   * @return {boolean}
   */
  async logoutClear(key) {
    const client = await this.getClient();
    client.select(1);
    await client.del(key);
    console.log('Logout clean successed');
    return true;
  };

  /**
   * @constructor
   */
  constructor() {
    this.getClient = this.getClient.bind(this);
    this.getIDContext = this.getIDContext.bind(this);
    this.conversationIDSet = this.conversationIDSet.bind(this);
    this.getOneConversationID = this.getOneConversationID.bind(this);
    this.loginInput = this.loginInput.bind(this);
    this.loginCheck = this.loginCheck.bind(this);
    this.logoutClear = this.logoutClear.bind(this);
  }
};
