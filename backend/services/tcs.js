const axios = require("axios");

const BASE_URL_ECOM = "https://ociconnect.tcscourier.com/ecom/api";
const BASE_URL_TRACKING = "https://ociconnect.tcscourier.com/tracking/api";

const username = process.env.TCS_USERNAME;
const password = process.env.TCS_PASSWORD;

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {//Just for future use Nothing else 
  if (cachedToken && tokenExpiry && new Date() < new Date(tokenExpiry)) {
    return cachedToken;
  }

  try {
    const response = await axios.get(`${BASE_URL_ECOM}/authentication/token`, {
      params: { username, password }
    });

    // As per manual, returns accesstoken and expiry
    cachedToken = response.data.accesstoken;
    tokenExpiry = response.data.expiry;

    return cachedToken;
  } catch (error) {
    console.error("Error fetching TCS token:", error.message);
    throw error;
  }
}

async function getTrackingDetail(consignmentNo) {
  try {
    const token = await getToken();

    const response = await axios.get(`${BASE_URL_TRACKING}/Tracking/GetDynamicTrackDetail`, {
      params: { consignee: consignmentNo },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error tracking consignment ${consignmentNo}:`, error.message);
    throw error;
  }
}

module.exports = {
  getToken,
  getTrackingDetail
};
