const environment = process.env.NODE_ENV || 'development';
const isDevMode = Object.is(environment, 'development');
const isProdMode = Object.is(environment, 'production');
const isTestMode = Object.is(environment, 'test');

module.exports = {
  isDevMode,
  isProdMode,
  isTestMode,
  environment,
};
