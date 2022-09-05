// server/index.js

const path = require('path');
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const https = require('https');
const { hostname } = require('os');

const constants = require('./constants');

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, response) => {
  response.json({"Data": "Hello from server"});
});

const getAllProject = require('./api/GetAllProject');
app.use('/api/get-all-project', getAllProject);

const getAllRepo = require('./api/GetAllRepo');
app.use('/api/get-all-repo', getAllRepo);

const getAllBranch = require('./api/GetAllBranch');
app.use('/api/get-all-branch', getAllBranch);

const getBranchInfo = require('./api/GetBranchInfo');
app.use('/api/get-branch-info', getBranchInfo);

const getGraph = require('./api/GetGraph');
app.use('/api/get-graph', getGraph);

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});