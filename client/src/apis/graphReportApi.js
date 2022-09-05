import { handleResponse, handleError } from "./apiUtils";
// const baseUrl = process.env.REACT_APP_API_URL + "/authors/";

export function getGraphReportApi(projectId, repoid) {
  return fetch("/api/get-graph?projectid="+ projectId +"&repositoryid="+repoid)
    .then(handleResponse)
    .catch(handleError);
}