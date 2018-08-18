var environments = {

    staging: {
        'httpPort': 3000,
        'httpsPort' : 3001,
        'envName': 'staging'
    },

    production: {
        'httpPort': 5000,
        'httpPort': 5001,
        'envName': 'production'
    },

};


nodeEnv = 'NODE_ENV' in process.env ? process.env.NODE_ENV : 'staging';

environment = nodeEnv in environments ? environments[nodeEnv] : environments.staging;

module.exports = environment;
