const MongoClient = require('mongodb').MongoClient;
const { MONGODB_URI } = process.env;

module.exports = class Mongodb {
  /**
  * mongoDB 初始化
  * @return {boolean} 連接狀況回應
  */
  init() {
    const _this = this;
    return new Promise((resolve, reject) => {
      MongoClient.connect(MONGODB_URI,
        { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
          if (err) {
            console.log('connect error:', err);
            reject(err);
          } else {
            console.log('success connect to db');
            _this.db = db;
            resolve(db);
          }
        });
    });
  };

  /**
  * 輸入資料
  * @param {string} dbName db名稱
  * @param {string} collection collection名稱
  * @param {object} document 輸入資料
  * @return {Promise<object>}
  */
  insertOne(dbName, collection, document) {
    return new Promise((resolve, reject) => {
      const dbo = this.db.db(dbName);
      dbo.collection(collection).insertOne(document, function (err, res) {
        if (err) {
          console.log('connect error:', err);
          reject(err);
        } else {
          console.log('success insert document');
          resolve(res);
        }
      });
    });
  };

  /**
  * 輸入資料
  * @param {string} dbName db名稱
  * @param {string} collection collection名稱
  * @param {JSON} condition 更新資料條件
  * @param {object} newData 更新資料
  * @return {Promise<object>} 更新結果
  */
  updateData(dbName, collection, condition, newData) {
    return new Promise((resolve, reject) => {
      const dbo = this.db.db(dbName);
      dbo.collection(collection).updateOne(condition, newData,
        function (err, res) {
          if (err) {
            console.log('connect error:', err);
            reject(err);
          } else {
            console.log('success update data');
            resolve(res);
          }
        });
    });
  };

  /**
   * 找尋一筆資料
   * @param {*} dbName 
   * @param {*} collection 
   * @returns {Promise<object>} 尋找結果
   */
  findConversationIDList(dbName, collection) {
    return new Promise((resolve, reject) => {
      const dbo = this.db.db(dbName);
      dbo.collection(collection).findOne(function (err, res) {
        if (err) {
          console.log('connect error: ', err);
          reject(err);
        } else {
          console.log('find data succeeded');
          resolve(res);
        }
      })
    })
  };

  /**
   * @constructor
   */
  constructor() {
    this.init = this.init.bind(this);
    this.insertOne = this.insertOne.bind(this);
    this.updateData = this.updateData.bind(this);
    this.findConversationIDList = this.findConversationIDList.bind(this);
  }
};
