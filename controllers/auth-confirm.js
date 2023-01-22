const AuthService = require('../services/authorization-services');
const Mongodb = require('../services/mongodb-services');
const Redis = require('../services/redis-services');
const HTTPRuntimeError = require('../errors/http-runtime');
const {TokenExpiredError: JWTTokenExpiredError} = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');

const auth = new AuthService();
const MongodbCtl = new Mongodb();
const RedisCtl = new Redis();

const {MONGODB_NAME, IDS_AMOUNT} = process.env;

MongodbCtl.init();

module.exports = class AuthController {
  /**
   * login
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async login(req, res, next) {
    try {
      const {user, platform} = req.body;
      const requiredBodyKeyButDidNotGet = ['user', 'platform'].filter(
        (key) => !req.body[key],
      );
      if (requiredBodyKeyButDidNotGet.length) {
        const errorMessage =
          `need parameters: ${requiredBodyKeyButDidNotGet.join(', ')}`;
        throw new HTTPRuntimeError(errorMessage, 400, errorMessage);
      };
      const conversationData = await this.getConversationID(user);
      const data = {
        userID: user,
        conversationID: conversationData.conversation_id,
      };
      const token = await auth.tokenGenerate(data);
      const userKey = `${data.userID}-${platform}`;
      RedisCtl.loginInput(userKey, token);
      res.json({jwt: token});
    } catch (err) {
      console.error(err);
      err.statusCode = err.statusCode || '500';
      next(err);
    }
  }

  /**
   * verify
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async verify(req, res, next) {
    try {
      // const token = req.get('Authorization').replace('Bearer ', '');
      // const {platform} = req.body;
      const {token} = req.body;
      // const requiredBodyKeyButDidNotGet = ['platform'].filter(
      //   (key) => !req.body[key],
      // );
      // if (requiredBodyKeyButDidNotGet.length) {
      //   const errorMessage =
      //     `need parameters: ${requiredBodyKeyButDidNotGet.join(', ')}`;
      //   throw new HTTPRuntimeError(errorMessage, 400, errorMessage);
      // };

      const decodedToken = await auth.tokenDecode(token);
      // const userKey = `${decodedToken.userID}-${platform}`;
      // 暫時關閉For Decode
      /*
      const redisLoginRecord = await RedisCtl.loginCheck(userKey);

      if (!redisLoginRecord) {
        const err = {
          statusCode: '401',
          message: 'Authentication failed. Token expired.',
        };
        throw err;
      } else {
        res.json(decodedToken);
      }
      */
      res.json(decodedToken);
    } catch (err) {
      console.error(err);
      if (err instanceof JWTTokenExpiredError) {
        err.statusCode = '401';
        err.message = 'Authentication failed. Token expired.';
      } else {
        err.statusCode = err.statusCode || '500';
      }
      next(err);
    }
  }

  /**
   * logout
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async logout(req, res, next) {
    try {
      const {platform} = req.body;
      const token = req.get('Authorization').replace('Bearer ', '');

      const requiredBodyKeyButDidNotGet = ['platform'].filter(
        (key) => !req.body[key],
      );
      if (requiredBodyKeyButDidNotGet.length) {
        const errorMessage =
          `need parameters: ${requiredBodyKeyButDidNotGet.join(', ')}`;
        throw new HTTPRuntimeError(errorMessage, 400, errorMessage);
      };

      const {userID} = await auth.tokenDecode(token, false);
      const userKey = `${userID}-${platform}`;
      await RedisCtl.logoutClear(userKey);
      res.json({status: 'Logout'});
    } catch (err) {
      console.error(err);
      if (err instanceof JWTTokenExpiredError) {
        err.statusCode = '401';
        err.message = 'Authentication failed. Token expired.';
      } else {
        err.statusCode = err.statusCode || '500';
      }
      next(err);
    }
  }

  /**
  * 產生新conversationID清單
  * @return {array} one conversationID
  */
  createConversationIDs() {
    const ids = new Array(
      (IDS_AMOUNT - 0) || 1000).fill().map(() => uuidv4(),
    );
    // 存入mongo
    MongodbCtl.insertOne(MONGODB_NAME, 'conversationID', {ids});
    // 存入redis
    RedisCtl.conversationIDSet(ids);
    return ids[0];
  }

  /**
   * 檢查mongo內是否有conversationID備份
   * @return {array} one conversationID
   */
  checkConversationIDsInMongo() {
    const {ids} = MongodbCtl.findConversationIDList(
      MONGODB_NAME, 'conversationID');
    if (!ids) {
      // mongo無備份 建一份新list
      return this.createConversationIDs();
    } else {
      // mongo有備份 取出存入redis 並回傳一筆id供使用
      RedisCtl.conversationIDSet(ids);
      return ids[0];
    }
  }

  /**
  * 取得可用userID
  * @async
  * @param {string} userID
  * @return {Promise<string>} conversationID
  */
  async getConversationID(userID) {
    let context;
    let conversationID;
    // 檢查userID對話紀錄
    let lastContext = await RedisCtl.getIDContext(userID);

    // 無對話紀錄 從redis清單取一個conversationID
    if (!lastContext) {
      conversationID = await RedisCtl.getOneConversationID();

      // 確認redis內ID
      if (!conversationID)
      // 無可用ID 產生新ID
      {
        conversationID = await this.checkConversationIDsInMongo();
      }
      context = {
        conversation_id: conversationID,
      };
    } else if (lastContext) {
      // 沿用對話資料
      lastContext = JSON.parse(lastContext);
      context = {
        skill: lastContext.context.skill,
        context: lastContext.context.context,
        sessionID: lastContext.sessionID,
      };
    }
    return context;
  }

  /**
  * @constructor
  */
  constructor() {
    this.login = this.login.bind(this);
    this.verify = this.verify.bind(this);
    this.logout = this.logout.bind(this);
    this.createConversationIDs = this.createConversationIDs.bind(this);
    this.getConversationID = this.getConversationID.bind(this);
  }
};
