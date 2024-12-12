const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const loadConfig = () => {
  try {
    const configPath = path.resolve(__dirname, 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Error reading config file:', error);
    return {};
  }
};

// Generate a secure random ID
const makeid = (len = 32) => {
  return crypto.randomBytes(len / 2).toString('hex');
};

const initEnv = (env = process.env.NODE_ENV) => {
  env = ['development', 'test', 'production'].includes(env) 
    ? env 
    : 'development';

  const config = loadConfig();
  const envConfig = config[env] || {};

  // Set environment variables
  Object.keys(envConfig).forEach((key) => {
    if (!process.env[key]) {
      process.env[key] = envConfig[key];
    }
  });

  // Special handling for production
  if (env === 'production') {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = makeid(32);
    }

    const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(
      variable => !process.env[variable]
    );

    if (missingVars.length > 0) {
      console.error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
      process.exit(1);
    }
  }

  process.env.NODE_ENV = env;
  return env;
};

module.exports = { 
  initEnv, 
  makeid 
};