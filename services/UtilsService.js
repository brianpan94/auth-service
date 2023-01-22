let LoggerService = require('./LoggerService.js');
let tryErrorLogger = LoggerService.getLogger('tryerrorCategory');

class UtilsService {
    // 取代 console 原本的執行方法改由 log4js 來執行
    replaceConsole() {
        let defaultLogger = LoggerService.getLogger();
        console.log = defaultLogger.debug.bind(defaultLogger);
        console.error = defaultLogger.error.bind(defaultLogger);
    }

    async tryLog(runFunction) {
        try {
            return await runFunction();
        } catch (err) {
            tryErrorLogger.error(err);
            return Promise.reject(err);
        }
    }
}

module.exports = new UtilsService();
