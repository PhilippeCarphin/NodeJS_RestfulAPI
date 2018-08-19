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

const twilio = {
    // Magic phone number from Twilio (always available).
    // Otherwise, I would have to add twilio phone numbers.
    "fromPhone": "+15005550006",
    // Twilio test credentials (twilio will not serve the request but respond as if it did).
    "accountSid": "ACe4caac765658fc89f94252e621d6f240",
    "authToken" : "8fdc2feb798b333be7315239a91b883a"
};


nodeEnv = 'NODE_ENV' in process.env ? process.env.NODE_ENV : 'staging';

environment = nodeEnv in environments ? environments[nodeEnv] : environments.staging;

module.exports = {'environment': environment, 'https': https, 'twilio': twilio};
