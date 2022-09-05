let packageData = require("../package.json");
export const msalConfig = {
    auth: {
      clientId: "52d32468-6c62-405f-88d2-411e2a11ecde",
      authority: "https://login.microsoftonline.com/d1ee1acd-bc7a-4bc4-a787-938c49a83906", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: packageData.authRedirectURL,
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.Read"]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
  };