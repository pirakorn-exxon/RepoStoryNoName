import { handleResponse, handleError } from "./apiUtils";
// const baseUrl = process.env.REACT_APP_API_URL + "/authors/";

export function getProjectApi() {
  return fetch("/api/get-all-project")
    .then(handleResponse)
    .catch(handleError);
}