import { handleResponse, handleError } from "./apiUtils";
// const baseUrl = process.env.REACT_APP_API_URL + "/authors/";

export function getReportApi(projectId, repoid, branchname) {
  // /api/get-branch-info?projectid=4cd92f5c-4d71-418f-841b-de2516cc9005&repositoryid=97286a02-cd61-40a8-90e6-ab830cc2deba&branchid=features%2FTest-API
  console.log(projectId);
  console.log(repoid);
  console.log(encodeURIComponent(branchname));

  return fetch("/api/get-branch-info?projectid="+ projectId + "&&repositoryid="+repoid + "&&branchid="+encodeURIComponent(branchname))
    .then(handleResponse)
    .catch(handleError);
}