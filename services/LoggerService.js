const log4js = require('log4js');
const loggerConfig = require('../configs/logger');

class AppenderSetting {
  constructor(appenders) {
    for (const key in appenders) {
      const appender = appenders[key];
      if (this[`${appender.type}Appender`]) {
        appenders[key] = this[`${appender.type}Appender`](appender, appenders);
      }
    }

    return appenders;
  }

  replaceAppender({type, replaceAppenderName, ...currentAppenderData}, appenders) {
    const targetAppenderData = appenders[replaceAppenderName];
    currentAppenderData = {
      ...targetAppenderData,
      ...currentAppenderData,
    };
    return currentAppenderData;
  }
}

class LoggerService {
  constructor(config) {
    config.appenders = new AppenderSetting(config.appenders);
    this.addLayouts();

    log4js.configure(config);
    return log4js;
  }

  addLayouts() {
    log4js.addLayout('jsonToString', function(layoutConfig) {
      return function(logEvent) {
        return JSON.stringify(logEvent) + (layoutConfig.separator || '');
      };
    });
  }
}

module.exports = new LoggerService(loggerConfig);
