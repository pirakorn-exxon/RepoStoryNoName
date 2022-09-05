import { handleResponse, handleError } from "./apiUtils";
// const baseUrl = process.env.REACT_APP_API_URL + "/authors/";

export function getBranchApi(projectid, repoid) {
  return fetch("/api/get-all-branch?projectid="+ projectid +"&&repositoryid="+repoid)
    .then(handleResponse)
    .catch(handleError);
}