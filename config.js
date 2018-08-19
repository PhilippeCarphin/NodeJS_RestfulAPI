var environments = {

    staging: {
        'httpPort': 3000,
        'httpsPort' : 3001,
        'envName': 'staging',
        'hashSecret': 'ThisIsSecret',
    },

    production: {
        'httpPort': 5000,
        'httpPort': 5001,
        'envName': 'production',
        'hashSecret': 'ThisIsSecret',
    },

};

var https = {
    'keyFile': './https/key.pem',
    'certFile': './https/cert.pem'
};


nodeEnv = 'NODE_ENV' in process.env ? process.env.NODE_ENV : 'staging';

environment = nodeEnv in environments ? environments[nodeEnv] : environments.staging;

module.exports = {'environment': environment, 'https': https};
