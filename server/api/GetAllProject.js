const express = require('express');
const router = express.Router();
const https = require('https');

const constants = require('../constants');

// Get-All-Project: Return all project
router.get('/', (request, response) => {
    response.setHeader("Content-Type", "application/json");

    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/_apis/projects?' + constants.APIVersion;
    let ADOreq = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        let data = "";

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('error', (error) => {
            console.log(error);
        });

        res.on('end', () => {
            data = JSON.parse(data);
            try {
                if ("count" in data && "value" in data) {
                    let returnData = data["value"];
                    returnData.sort((a, b) => a.name.localeCompare(b.name));
                    response.json({ "Projects": returnData });
                } else {
                    throw "Count or Value not found";
                }
            } catch (errorMessage) {
                response.json("Error: " + errorMessage);
            }
        });
    });

    ADOreq.on('error', error => {
        console.error(error);
    });

    ADOreq.end();
});

module.exports = router;