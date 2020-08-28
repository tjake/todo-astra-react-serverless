const fetch = require('cross-fetch')
const ENDPOINT = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v1`;
const ASTRA_DB_USERNAME = process.env.ASTRA_DB_USERNAME;
const ASTRA_DB_PASSWORD = process.env.ASTRA_DB_PASSWORD;

/*
 * This global variable will persist across requests throughout the life of the lambda.
 * We only need to fetch a token for the first request
 * Lambda creates new containters when the original one expires or if there is high concurrency
 * in which case the new containers will have to fetch their own tokens.
 */
let cachedToken;

module.exports = async function getOrCreateAuthToken() {
  if (cachedToken) {
    return cachedToken;
  }
  try {
    const response = await fetch(`${ENDPOINT}/auth`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        username: ASTRA_DB_USERNAME,
        password: ASTRA_DB_PASSWORD,
      }),
    });
    cachedToken = await response.json();
    return cachedToken;
  } catch (e) {
    throw new Error('Could not authenticate with the Astra API');
  }
}
