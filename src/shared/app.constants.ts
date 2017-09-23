export class Auth0Vars {
  static AUTH0_CLIENT_ID = 'AX6mKLHYp6GVtEcOe5RSmyggmZkiXyQH';
  static AUTH0_SECRET = 'WR21k3S2RcPPD6GIPrpgHbpCmzi4YPPgKUxL2kiqeFpOke_2TjSjNmoukVioucaf';
  static AUTH0_DOMAIN = 'surgipal.auth0.com';
  static AUTH0_CALLBACK_URL = location.href;
}
export class SendGridVars {
  //static key = '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';
    static key = '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';
  static billingTemplate = '661d5e3f-113c-4ee1-8b93-76b5ac74523b';
}
export class AzureMobile {
  static url = 'https://surgimobile.azurewebsites.net/';
}

export let CONFIGURATION = {
  environment: "DEV",
  baseUrls: {
    // server: 'https://surgipaldata.azurewebsites.net/',
  apiUrl: 'https://surgipaldata.azurewebsites.net/api/',
 //apiUrl: 'http://localhost:32799/api/',
    server: 'https://surgipal.com/',
    apiPhp: 'https://surgipal.com/api/api.php/'
  }
};
