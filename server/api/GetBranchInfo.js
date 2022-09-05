const { count } = require('console');
const express = require('express');
const router = express.Router();
const https = require('https');

const constants = require('../constants');

// Get Branch Information to Display in the Table
router.get("/", (request, response) => {
  response.setHeader("Content-Type", "application/json");;

  const projectID = request.query.projectid;
  const repositoryID = request.query.repositoryid;
  const branchID = decodeURIComponent(request.query.branchid);
  const branchIDEncoded = encodeURIComponent(branchID);

  const commitsContainer = {
    "TotalCommit": 0,
    "Commits": []
  };

  const promiseAllCommitsFromBranch = getAllCommitsFromBranch(repositoryID, branchIDEncoded, commitsContainer, 0, 1000);
  const promiseDefaultBranch = getDefaultBranch(projectID, repositoryID);
  const promiseBranchStatistics = getBranchStatistics(projectID, repositoryID, branchIDEncoded);
  const promiseBranchCreator = getBranchCreator(projectID, repositoryID);

  Promise.allSettled([
    promiseAllCommitsFromBranch,
    promiseDefaultBranch,
    promiseBranchStatistics,
    promiseBranchCreator
  ])
    .then(function ([allCommit, defaultBranch, branchStatistics, allBranches]) {
      allCommit = allCommit["value"];
      defaultBranch = defaultBranch["value"].replace("refs/heads/", "");
      let creatorName = "Unknown";
      for(const element of allBranches["value"]) {
        const thisBranchID = element["name"].replace("refs/heads/", "");
        if (branchID == thisBranchID) {
          creatorName = element["creator"]["displayName"];
          break;
        }
      }
      const promiseFindCommitInDefaultBranch = findCommitInDefaultBranch(repositoryID, defaultBranch, allCommit["Commits"], 0);
      Promise.allSettled([
        promiseFindCommitInDefaultBranch
      ])
        .then(function ([foundCommit]) {
          // Preparing data for response
          const latestSyncWithDefaultBranch = new Date(foundCommit["value"]["Commit"][0]["committer"]["date"]);
          const latestCommitDate = new Date(allCommit["Commits"][0]["committer"]["date"]);
          let commitForFrontend = [];
          for(const thisCommit of allCommit["Commits"]) {
            const date = new Date(thisCommit["committer"]["date"]);
            dataTableObject = {
              "date": date.toUTCString(),
              "committer": thisCommit["committer"]["name"],
              "comment": thisCommit["comment"]
            };
            commitForFrontend.push(dataTableObject);
          }
          responseData = {
            "BranchName": branchID,
            "TotalCommit": allCommit["TotalCommit"],
            "CreatedBy": creatorName,
            "NumberOfCommitFromLatestSyncWithDefaultBranch": foundCommit["value"]["Index"],
            "LatestSyncWithDefaultBranch": latestSyncWithDefaultBranch.toUTCString(),
            "AheadCount": branchStatistics["value"]["aheadCount"],
            "BehindCount": branchStatistics["value"]["behindCount"],
            "LatestCommitDate": latestCommitDate.toUTCString(),
            "Commits": commitForFrontend
          };
          response.json(responseData);
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
    });

});

// Get All Commit from Branch
function getAllCommitsFromBranch(repositoryID, branchID, commitsContainer, skip, commitRetrieve) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/_apis/git/repositories/' + repositoryID + '/commits?itemVersion.version=' + branchID + '&$skip=' + skip + '&$top=' + commitRetrieve + '&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      let data = "";

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('error', (error) => {
        response.json("Error: " + error);
      });

      res.on('end', () => {
        data = JSON.parse(data);
        try {
          if ("count" in data && "value" in data) {
            commitsContainer["TotalCommit"] += data["count"];
            commitsContainer["Commits"] = commitsContainer["Commits"].concat(data["value"]);
            if (data["count"] == commitRetrieve) {
              resolve(getAllCommitsFromBranch(repositoryID, branchID, commitsContainer, skip + commitRetrieve, commitRetrieve))
            } else {
              resolve(commitsContainer);
            }
          } else {
            throw "Count or Value not found";
          }
        } catch (errorMessage) {
          reject("Error: " + errorMessage);
        }
      });
    });

    ADOreq.on('error', error => {
      console.error(error);
    });

    ADOreq.end();
  });
}

// Get Default Branch name from Repo
function getDefaultBranch(projectID, repositoryID) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/' + projectID + '/_apis/git/repositories/' + repositoryID + '?' + constants.APIVersion;
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
          if ("defaultBranch" in data) {
            resolve(data['defaultBranch']);
          } else {
            throw 'Default Branch not found';
          }
        } catch (errorMessage) {
          reject("Error: " + errorMessage);
        }
      });
    });

    ADOreq.on('error', error => {
      console.error(error);
    });

    ADOreq.end();
  });
}

// Get Branch Statistics (aheadCount, behindCount)
function getBranchStatistics(projectID, repositoryID, branchID) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/' + projectID + '/_apis/git/repositories/' + repositoryID + '/stats/branches?name=' + branchID + '&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      let data = "";

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('error', (error) => {
        response.json("Error: " + error);
      });

      res.on('end', () => {
        data = JSON.parse(data);
        try {
          if ("aheadCount" in data && "behindCount" in data) {
            resolve({ "aheadCount": data["aheadCount"], "behindCount": data["behindCount"] });
          } else {
            throw "aheadCount or behindCount not found";
          }
        } catch (errorMessage) {
          reject("Error: " + errorMessage);
        }
      });
    });

    ADOreq.on('error', error => {
      console.error(error);
    });

    ADOreq.end();
  });
}

// Get Branch Creator
function getBranchCreator(projectID, repositoryID) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/' + projectID + '/_apis/git/repositories/' + repositoryID + '/refs?filter=heads/&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      let data = "";

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('error', (error) => {
        response.json("Error: " + error);
      });

      res.on('end', () => {
        data = JSON.parse(data);
        try {
          if ("count" in data && "value" in data) {
            resolve(data["value"]);
          } else {
            throw "Invalid return from GetBranchCreator";
          }
        } catch (errorMessage) {
          reject("Error: " + errorMessage);
        }
      });
    });

    ADOreq.on('error', error => {
      console.error(error);
    });

    ADOreq.end();
  });
}

// Find Commit in Default Branch
function findCommitInDefaultBranch(repositoryID, defaultBranch, commitToFind, commitIndex) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/_apis/git/repositories/' + repositoryID + '/commits?itemVersion.version=' + defaultBranch + '&fromCommitId=' + commitToFind[commitIndex]["commitId"] + '&toCommitId=' + commitToFind[commitIndex]["commitId"] + '&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      let data = "";

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('error', (error) => {
        response.json("Error: " + error);
      });

      res.on('end', () => {
        data = JSON.parse(data);
        try {
          if ("count" in data && "value" in data) {
            if (data["count"] > 0) {
              resolve({
                "Index": commitIndex,
                "Commit": data["value"]
              });
            } else {
              try {
                resolve(findCommitInDefaultBranch(repositoryID, defaultBranch, commitToFind, commitIndex + 1));
              } catch (error) {
                reject("An error has occurred");
              }
            }
          } else {
            throw "An error has occurred, Count not found";
          }
        } catch (errorMessage) {
          reject("Error: " + errorMessage);
        }
      });
    });

    ADOreq.on('error', error => {
      console.error(error);
    });

    ADOreq.end();
  });
}

module.exports = router;