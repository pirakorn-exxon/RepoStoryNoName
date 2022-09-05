import { handleResponse, handleError } from "./apiUtils";
// const baseUrl = process.env.REACT_APP_API_URL + "/authors/";

export function getTestAPI() {
  return fetch("/api")
    .then(handleResponse)
    .catch(handleError);
}