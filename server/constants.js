const tempAuth = 'Omh6ZTdmNGxqbm5jd3lmZmd6eGdiZHhyemFycHBvamV6c3MzbXRwN2pnanZ2aW1pdW9xa2E=';
const httpsHostname = 'dev.azure.com';
const httpsPort = 443;
const httpsHeaders = {
    'Authorization': 'Basic ' + tempAuth,
    'Accept': 'application/json'
};

module.exports = {
    organization: 'emitdev',
    APIVersion: 'api-version=7.0',
    httpsGETOptions: {
        hostname: httpsHostname,
        port: httpsPort,
        method: 'GET',
        headers: httpsHeaders,
    }
};
