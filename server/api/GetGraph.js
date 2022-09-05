const { count } = require('console');
const express = require('express');
const router = express.Router();
const https = require('https');

const constants = require('../constants');
const { all } = require('./GetBranchInfo');

// Get Graph (Return as JSON Graph Creation Element)
router.get("/", (request, response) => {
  response.setHeader("Content-Type", "application/json");;

  const projectID = request.query.projectid;
  const repositoryID = request.query.repositoryid;

  const commitsContainer = {
    "TotalCommit": 0,
    "Commits": []
  };

  const promiseAllCommitsInRepo = getAllCommitsFromRepo(repositoryID, commitsContainer, 0, 1000);
  const promiseDefaultBranch = getDefaultBranch(projectID, repositoryID);
  const promiseAllBranches = getAllBranches(projectID, repositoryID);
  const promiseAllPullRequest = getAllCompletedPullRequest(projectID, repositoryID);

  console.log("GetGraph: START retrieving All Commits, Default Branch, All Branches, and All Pull Requests");
  Promise.allSettled([
    promiseAllCommitsInRepo,
    promiseDefaultBranch,
    promiseAllBranches,
    promiseAllPullRequest
  ])
    .then(function ([allCommit, defaultBranch, allBranches, allPullRequests]) {
      // All Commit from Repo
      allCommit = allCommit["value"];
      allCommit["Commits"].reverse();

      // Default Branch name for this Repo
      defaultBranch = defaultBranch["value"];

      // All Branches in this Repo
      allBranches = allBranches["value"];

      // All Pull Requests in this Repo
      allPullRequests = allPullRequests["value"];

      console.log("GetGraph: FINISH retrieving All Commits, Default Branch, All Branches, and All Pull Requests");

      // Get All Commits in each Branches and Get All Commits in each Pull Requests
      const numberOfBranches = allBranches.length;
      if (numberOfBranches > 0) {
        // Container for all Promises
        let allPromises = [];

        // Get All Commits in each Branches
        const commitsFromAllBranchesContainer = {};
        for (let branchIndex = 0; branchIndex < numberOfBranches; branchIndex++) {
          allPromises.push(getAllCommitsFromAllBranches(repositoryID, allBranches, commitsFromAllBranchesContainer, branchIndex, numberOfBranches, 0, 1000));
        }

        // Get All Commits in each Pull Requests
        const pullRequestsContainer = [];
        const numberOfPullRequests = allPullRequests.length;
        for (let pullRequestIndex = 0; pullRequestIndex < numberOfPullRequests; pullRequestIndex++) {
          allPromises.push(getAllCommitsFromAllPullRequests(projectID, repositoryID, pullRequestsContainer, allPullRequests, pullRequestIndex));
        }

        console.log("GetGraph: START retrieving All Commits from All Branches, and All Commits from All Pull Requests");
        Promise.allSettled(allPromises)
          .then(function (responseFromAllPromises) {
            // All Commits from All Branches
            allCommitsFromAllBranches = {};
            for (let branchIndex = 0; branchIndex < numberOfBranches; branchIndex++) {
              allCommitsFromAllBranches[responseFromAllPromises[branchIndex]["value"]["BranchName"]] = responseFromAllPromises[branchIndex]["value"];
            }

            // All Commits from all Pull Requests
            allCommitsFromAllPullRequests = {};
            for (let pullRequestIndex = 0; pullRequestIndex < numberOfPullRequests; pullRequestIndex++) {
              allCommitsFromAllPullRequests[responseFromAllPromises[pullRequestIndex + numberOfBranches]["value"]["PullRequestID"]] = responseFromAllPromises[pullRequestIndex + numberOfBranches]["value"];
            }

            console.log("GetGraph: FINISH retrieving All Commits from All Branches, and All Commits from All Pull Requests");

            // let temp = findCommitInPullRequest("c3ca224c596eddddb06d8e07705cdcca5ed919bb", allCommitsFromAllPullRequests);
            // console.log(temp);

            try {
              let graphData = [];
              let graphPoint = {};
              let branchesAlreadyInGraph = [];
              let latestCommitInBranch = {};
              let branchWaitingToMerge = [];
              let graphBranches = {};
              allCommit["Commits"].forEach(thisCommit => {

                let findCommitInPullRequestResult = findCommitInPullRequest(thisCommit["commitId"], allCommitsFromAllPullRequests);
                // This commit is in Pull Request
                if (findCommitInPullRequestResult["InPullRequest"]) {
                  console.log("Processing: " + thisCommit["commitId"] + ", Found in Pull Request");
                  // Check whether the source branch is already in the graph or not
                  // Source branch already in Graph
                  if (branchesAlreadyInGraph.includes(findCommitInPullRequestResult["SourceBranch"])) {
                    // Do nothing for now
                  }
                  // Source branch is not in Graph
                  else {
                    // Find the parent of this commit
                    // TODO; Future Releases
                    // Assuming all branch is derived from default branch
                    branchesAlreadyInGraph.push(findCommitInPullRequestResult["SourceBranch"]);
                    graphBranches[findCommitInPullRequestResult["SourceBranch"]] = [];
                    graphPoint = createGraphBranch(findCommitInPullRequestResult["SourceBranch"], defaultBranch);
                    graphData.push(graphPoint);
                  }
                  latestCommitInBranch[findCommitInPullRequestResult["SourceBranch"]] = thisCommit["commitId"];
                  graphBranches[findCommitInPullRequestResult["SourceBranch"]].push(thisCommit["commitId"])
                  graphPoint = createGraphCommit(findCommitInPullRequestResult["SourceBranch"], thisCommit["comment"]);
                  graphData.push(graphPoint);

                  // Check whether this commit is the last commit in pull request or not
                  if (findCommitInPullRequestResult["WaitingToMerge"]) {
                    // Check if this pull request's commits are already in the destination branch
                    if (findCommitInPullRequestResult["LastMergeCommitID"] == "") {
                      // If commits are already in the destination branch, merge right now
                      if (branchesAlreadyInGraph.includes(findCommitInPullRequestResult["DestinationBranch"])) {
                        graphPoint = createGraphMerge(findCommitInPullRequestResult["SourceBranch"], findCommitInPullRequestResult["DestinationBranch"]);
                      } else {
                        graphPoint = createGraphMerge(findCommitInPullRequestResult["SourceBranch"], defaultBranch);
                      }
                      graphData.push(graphPoint);
                    } else {
                      // Check whether the commitId to merge is already in the queue or not
                      if (!(findCommitInPullRequestResult["LastMergeCommitID"] in branchWaitingToMerge)) {
                        branchWaitingToMerge[findCommitInPullRequestResult["LastMergeCommitID"]] = [];
                      }
                      // Add this branch to the queue
                      branchWaitingToMerge[findCommitInPullRequestResult["LastMergeCommitID"]].push(
                        {
                          "SourceBranch": findCommitInPullRequestResult["SourceBranch"],
                          "DestinationBranch": findCommitInPullRequestResult["DestinationBranch"]
                        }
                      );
                    }
                  }
                }
                // This commit is not in Pull Request
                else {
                  // Check whether this commit is in default branch or not
                  // If commit is in default branch (DONE)
                  if (findCommitInDefaultBranch(thisCommit["commitId"], allCommitsFromAllBranches, defaultBranch)) {
                    console.log("Processing: " + thisCommit["commitId"] + ", Not Found in Pull Request, Found in Default Branch");
                    if (!(branchesAlreadyInGraph.includes(defaultBranch))) {
                      branchesAlreadyInGraph.push(defaultBranch);
                      graphBranches[defaultBranch] = [];
                      graphPoint = createGraphBranch(defaultBranch, "");
                      graphData.push(graphPoint);
                    }
                    latestCommitInBranch[defaultBranch] = thisCommit["commitId"];
                    graphBranches[defaultBranch].push(thisCommit["commitId"]);
                    graphPoint = createGraphCommit(defaultBranch, thisCommit["comment"]);
                    graphData.push(graphPoint);
                  }

                  // Commit is not in default branch
                  else {
                    console.log("Processing: " + thisCommit["commitId"] + ", Not Found in Pull Request, Not Found in Default Branch");
                    let foundInBranches = findCommitInBranch(thisCommit["commitId"], allCommitsFromAllBranches, defaultBranch);
                    foundInBranches.forEach(branch => {
                      if (branch["BranchName"] in branchesAlreadyInGraph) {
                        // Do nothing for now
                      }
                      // Branch is not in Graph
                      else {
                        // Find the parent of this commit
                        // TODO; Future Releases
                        // Assuming all branch is derived from default branch
                        branchesAlreadyInGraph.push(branch["BranchName"]);
                        graphBranches[branch["BranchName"]] = [];
                        graphPoint = createGraphBranch(branch["BranchName"], defaultBranch);
                        graphData.push(graphPoint);
                      }
                      latestCommitInBranch[branch["BranchName"]] = thisCommit["commitId"];
                      graphBranches[branch["BranchName"]].push(thisCommit["commitId"])
                      graphPoint = createGraphCommit(branch["BranchName"], thisCommit["comment"]);
                      graphData.push(graphPoint);
                    });
                  }
                }

                // Check if there is any branch waiting to merge at this commit
                if (thisCommit["commitId"] in branchWaitingToMerge) {
                  branchWaitingToMerge[thisCommit["commitId"]].forEach(merge => {
                    if (branchesAlreadyInGraph.includes(merge["DestinationBranch"])) {
                      graphPoint = createGraphMerge(merge["SourceBranch"], merge["DestinationBranch"]);
                    } else {
                      graphPoint = createGraphMerge(merge["SourceBranch"], defaultBranch);
                    }
                    graphData.push(graphPoint);
                  });
                  delete branchWaitingToMerge[thisCommit["commitId"]];
                }

              });

              // Send the response
            response.json(graphData);

            } catch (errorMessage) {
              throw errorMessage;
            }

          })
          .catch(error => {
            console.log(error);
          })
      } else {
        throw "No Branch found in Repo";
      }

    })
    .catch(error => {
      console.log(error);
    });

});

function createGraphBranch(branchName, parent) {
  return {
    "Action": "Branch",
    "BranchName": branchName,
    "CommitName": "",
    "Parent": parent,
    "Tag": ""
  };
}

function createGraphCommit(branchName, commitName) {
  return {
    "Action": "Commit",
    "BranchName": branchName,
    "CommitName": commitName,
    "Parent": "",
    "Tag": ""
  };
}

function createGraphMerge(branchName, parent) {
  return {
    "Action": "Merge",
    "BranchName": branchName,
    "CommitName": "",
    "Parent": parent,
    "Tag": ""
  };
}

// Get All Commit from Repo
function getAllCommitsFromRepo(repositoryID, commitsContainer, skip, commitRetrieve) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/_apis/git/repositories/' + repositoryID + '/commits?$skip=' + skip + '&$top=' + commitRetrieve + '&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {

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
              resolve(getAllCommitsFromRepo(repositoryID, commitsContainer, skip + commitRetrieve, commitRetrieve))
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
            let defaultBranch = data["defaultBranch"];
            defaultBranch = defaultBranch.replace("refs/heads/", "");
            resolve(defaultBranch);
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

// Get All Branches
function getAllBranches(projectID, repositoryID) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/' + projectID + '/_apis/git/repositories/' + repositoryID + '/refs?filter=heads/&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {

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

// Get All Completed Pull Request
function getAllCompletedPullRequest(projectID, repositoryID) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/' + projectID + '/_apis/git/repositories/' + repositoryID + '/pullrequests?' + constants.APIVersion + '&searchCriteria.status=completed';
    let ADOreq = https.request(options, res => {
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
            resolve(data["value"]);
          } else {
            throw 'Count or Value not found';
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

// Recursively Get All Commit from Branches
function getAllCommitsFromAllBranches(repositoryID, allBranches, allCommitsFromAllBranches, branchIndex, numberOfBranches, skip, commitRetrieve) {
  return new Promise(function (resolve, reject) {
    if (!allBranches[branchIndex]) {
      reject("Error: Branch array index out of bound");
    }

    // Preparing Branch Parameter
    const fullBranchName = allBranches[branchIndex]["name"];
    const branchName = fullBranchName.replace("refs/heads/", "");
    const branchID = encodeURIComponent(branchName);

    // console.log("Current Branch Index: " + branchIndex + ", Total Branch: " + numberOfBranches);
    // console.log("Retrieving commits from branch: " + branchName);

    // Check whether this is the first time retrieving commits for this Branch or not
    if (skip === 0) {
      allCommitsFromAllBranches = {
        "BranchName": branchName,
        "BranchNameFull": fullBranchName,
        "BranchID": branchID,
        "BranchCreator": allBranches[branchIndex]["creator"]["displayName"],
        "TotalCommit": 0,
        "Commits": []
      };
    }

    let options = constants.httpsGETOptions;
    options.path = '/' + constants.organization + '/_apis/git/repositories/' + repositoryID + '/commits?itemVersion.version=' + branchID + '&$skip=' + skip + '&$top=' + commitRetrieve + '&' + constants.APIVersion;
    let ADOreq = https.request(options, res => {

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
            allCommitsFromAllBranches["TotalCommit"] += data["count"];
            allCommitsFromAllBranches["Commits"] = allCommitsFromAllBranches["Commits"].concat(data["value"]);
            if (data["count"] == commitRetrieve) {
              // Get remaining commits from this branch
              resolve(getAllCommitsFromAllBranches(repositoryID, allBranches, allCommitsFromAllBranches, branchIndex, numberOfBranches, skip + commitRetrieve, commitRetrieve))
            }
            // else if ((data["count"] < commitRetrieve) && (branchIndex < (numberOfBranches - 1))) {
            // All commits from this branch retrieved, move to the next branch
            // resolve(getAllCommitsFromAllBranches(repositoryID, allBranches, allCommitsFromAllBranches, branchIndex + 1, numberOfBranches, 0, commitRetrieve))
            // } 
            else {
              // console.log("Done retrieving commits from branch: " + branchName);
              // All commits from all branches retrieved, return the data
              resolve(allCommitsFromAllBranches);
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

// Get all Commit in each Pull Request
function getAllCommitsFromAllPullRequests(projectID, repositoryID, pullRequestContainer, pullRequestToFind, pullRequestIndex) {
  return new Promise(function (resolve, reject) {
    let options = constants.httpsGETOptions;

    options.path = '/' + constants.organization + '/' + projectID + '/_apis/git/repositories/' + repositoryID + '/pullRequests/' + pullRequestToFind[pullRequestIndex].pullRequestId + '/commits?' + constants.APIVersion;
    let ADOreq = https.request(options, res => {
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
            let returnData = data["value"];
            let result = [];
            for (let i = 0; i < returnData.length; i++) {
              // result.push({
              //   "commitId": returnData[i].commitId
              // });
              result.push(returnData[i].commitId);
            }
            pullRequestContainer = {
              "PullRequestID": pullRequestToFind[pullRequestIndex].pullRequestId,
              "SourceRefName": pullRequestToFind[pullRequestIndex].sourceRefName.replace("refs/heads/", ""),
              "TargetRefName": pullRequestToFind[pullRequestIndex].targetRefName.replace("refs/heads/", ""),
              "LastMergeSourceCommitID": pullRequestToFind[pullRequestIndex]["lastMergeSourceCommit"].commitId,
              "LastMergeTargetCommitID": pullRequestToFind[pullRequestIndex]["lastMergeTargetCommit"].commitId,
              "LastMergeCommitID": (("lastMergeCommit" in pullRequestToFind[pullRequestIndex]) ? pullRequestToFind[pullRequestIndex]["lastMergeCommit"].commitId : ""),
              "Commits": result
            };
            // if (pullRequestIndex < pullRequestToFind.length - 1) {
            // resolve(getPullRequestCommits(projectID, repositoryID, pullRequestContainer, pullRequestToFind, pullRequestIndex + 1));
            // } else {
            resolve(pullRequestContainer);
            // }
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

// Check if commit id is in any Pull Request
function findCommitInPullRequest(commitIdToFind, allPullRequests) {
  try {
    // console.log("Looking for CommitID: " + commitIdToFind);
    for (let pullRequestID in allPullRequests) {
      // console.log("Searching Pull Request: " + pullRequestID);
      const numberOfCommitsInThisPullRequest = allPullRequests[pullRequestID]["Commits"].length;
      // console.log("Number of Commits in this Pull Request: " + numberOfCommitsInThisPullRequest);
      for (let commitIndex = 0; commitIndex < numberOfCommitsInThisPullRequest; commitIndex++) {
        // console.log("Comparing " + allPullRequests[pullRequestID]["Commits"][commitIndex]["commitId"] + " and " + commitIdToFind);
        if (allPullRequests[pullRequestID]["Commits"][commitIndex] == commitIdToFind) {
          let returnData = {
            "InPullRequest": true,
            "PullRequestID": pullRequestID,
            "CommitID": commitIdToFind,
            "SourceBranch": allPullRequests[pullRequestID]["SourceRefName"],
            "DestinationBranch": allPullRequests[pullRequestID]["TargetRefName"],
            "LastMergeSourceCommitID": allPullRequests[pullRequestID]["LastMergeSourceCommitID"],
            "LastMergeTargetCommitID": allPullRequests[pullRequestID]["LastMergeTargetCommitID"],
            "LastMergeCommitID": allPullRequests[pullRequestID]["LastMergeCommitID"]
          };
          if (commitIndex == 0) {
            returnData["WaitingToMerge"] = true;
          } else {
            returnData["WaitingToMerge"] = false;
          }
          return returnData;
        }
      }
    }
    return {
      "InPullRequest": false,
      "PullRequestID": "",
      "CommitID": commitIdToFind,
      "SourceBranch": "",
      "DestinationBranch": "",
      "LastMergeSourceCommitID": "",
      "LastMergeTargetCommitID": "",
      "LastMergeCommitID": "",
      "WaitingToMerge": false
    };
  }
  catch (errorMessage) {
    throw errorMessage;
  }
}

function findCommitInDefaultBranch(commitIdToFind, allCommitsFromAllBranches, defaultBranch) {
  try {
    // allCommitsFromAllBranches[defaultBranch]["Commits"].forEach(element => {
      
    // });
    return allCommitsFromAllBranches[defaultBranch]["Commits"].find(thisCommits => thisCommits["commitId"] == commitIdToFind);
  } catch (errorMessage) {
    throw errorMessage;
  }
}

function findCommitInBranch(commitIdToFind, allCommitsFromAllBranches, defaultBranch) {
  try {
    let foundInBranches = [];
    for (let branchName in allCommitsFromAllBranches) {
      if (branchName == defaultBranch) {
        continue;
      } else {
        const numberOfCommitsInThisBranch = allCommitsFromAllBranches[branchName]["Commits"].length;
        for (let commitIndex = 0; commitIndex < numberOfCommitsInThisBranch; commitIndex++) {
          if (allCommitsFromAllBranches[branchName]["Commits"][commitIndex]["commitId"] == commitIdToFind) {
            foundInBranches.push({
              "BranchName": branchName,
              "ParentCommitID": ((commitIndex + 1) < numberOfCommitsInThisBranch ? allCommitsFromAllBranches[branchName]["Commits"][commitIndex + 1]["commitId"] : "")
            });
            break;
          }
        }
      }
    }
    return foundInBranches;
  } catch (errorMessage) {
    throw errorMessage;
  }
}

module.exports = router;