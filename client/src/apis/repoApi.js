import { handleResponse, handleError } from "./apiUtils";
// const baseUrl = process.env.REACT_APP_API_URL + "/authors/";

export function getRepoApi(projectId) {
  return fetch("/api/get-all-repo?projectid="+ projectId)
    .then(handleResponse)
    .catch(handleError);
}