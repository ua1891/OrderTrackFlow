const axios = require("axios");

const BASE_URL_TRACKING = "https://ociconnect.tcscourier.com/tracking/api";

// Hardcoded token provided by the user
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRpZCI6IjIxNTYyNDgyMCIsInNlcnZpY2VzIjoiMTAzLDE1NSwxNjEsMTY0LDIyNSwyNDcsMjQ4LDI0OSwyNTAsMjUxLDI3NywyOTMsMzY3LDM3MywzNzcsMzg4LDQ0OCw0NDksNDUwLDQ1MSw0NTIsNDUzLDQ1NCw0NzIsNDczIiwiZXhjbHVkZWQtc2VydmljZXMiOiIiLCJpc3MiOiJjb25uZWN0LnRjc2NvdXJpZXIuY29tIiwianRpIjoiYjMzZjc0MjItZDFiOS00MjMwLWI0NDctNTBmZmUwMTk4NTU3IiwibmJmIjoxNzczMjQ0NjkxLCJleHAiOjE4NTk2NDQ2OTEsImlhdCI6MTc3MzI0NDY5MX0.K5spEtZuz4y84qcrQESC0r7YmfY3MSmS-1t0GQhi-Rc";

async function getToken() {
  // Just return the hardcoded token for now as per user request
  return BEARER_TOKEN;
}

async function getTrackingDetail(consignmentNo) {
  try {
    const response = await axios.get(`${BASE_URL_TRACKING}/Tracking/GetDynamicTrackDetail`, {
      params: { consignee: consignmentNo },
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
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
