const getEnv = (key, defaultValue) => process.env[key] ?? defaultValue;

const config = {
  env: {
    nodeEnv: getEnv('NODE_ENV', 'development'),
    port: getEnv('PORT', 3001),
    logLevel: getEnv('PINO_LOG_LEVEL', 'info'),
    host: getEnv('HOST', '0.0.0.0')
  },
  seed: {
    userLogin: getEnv('SEED_USER_LOGIN', 'seed-user-login'),
    recoverPassword: getEnv('SEED_RECOVERY_PASSWORD', 'seed-recovery-password'),
    surveyStudents: getEnv('SEED_SURVEY_STUDENTS', 'seed-survey-students')
  },
  database: {
    postgres: {
      host: getEnv('DB_HOST', '127.0.0.1'),
      port: getEnv('DB_PORT', 5432),
      user: getEnv('DB_USER', 'root'),
      password: getEnv('DB_PASSWORD', 'root'),
      database: getEnv('DB_DATABASE', 'civiconectadb')
    },
    mongo: {
      url: getEnv('DATABASE_URL', 'mongodb://127.0.0.1:27017/civi-conecta-db')
    }
  },
  ftp: {
    rootFolder: getEnv('FTP_ROOT_FOLDER', 'temp'),
    host: getEnv('FTP_HOST', '127.0.0.1'),
    port: getEnv('FTP_PORT', 21),
    user: getEnv('FTP_USER', 'anonymous'),
    password: getEnv('FTP_PASSWORD', 'guest'),
    secure: getEnv('FTP_SECURE', false)
  },
  token: {
    expiration: {
      userLogin: getEnv('TOKEN_EXPIRATION_USER_LOGIN', '7d'),
      recoveryPassword: getEnv('TOKEN_EXPIRATION_RECOVERY_PASSWORD', '7d'),
      surveyStudents: getEnv('TOKEN_EXPIRATION_SURVEY_STUDENTS', '7d')
    }
  },
  email: {
    template: {
      subject: {
        recoveryPassword: getEnv('EMAIL_SUBJECT_RECOVERY_PASSWORD', 'Recovery Password'),
        surveyStudents: getEnv('EMAIL_SUBJECT_SURVEY_STUDENTS', 'Survey Students')
      },
      name: {
        recoveryPassword: getEnv('EMAIL_NAME_RECOVERY_PASSWORD', 'CiviConecta Support Team'),
        surveyStudents: getEnv('EMAIL_NAME_SURVEY_STUDENTS', 'CiviConecta Team')
      }
    },
    transport: {
      host: getEnv('EMAIL_TRANSPORTER_HOST', ''),
      port: getEnv('EMAIL_TRANSPORTER_PORT', ''),
      secure: getEnv('EMAIL_TRANSPORTER_SECURE', ''),
      service: getEnv('EMAIL_TRANSPORTER_SERVICE', ''),
      username: getEnv('EMAIL_TRANSPORTER_USERNAME', ''),
      password: getEnv('EMAIL_TRANSPORTER_PASSWORD', '')
    }
  },
  urls: {
    recoveryPassword: getEnv('RECOVERY_PASSWORD_URL', ''),
    surveyStudents: getEnv('SURVEY_STUDENTS_URL', ''),
    autoLogin: getEnv('AUTO_LOGIN_URL', '')
  }
};

config.email.transport.secure = Boolean(config.email.transport.secure);
config.email.transport.port = Number.parseInt(config.email.transport.port);

module.exports = config;
