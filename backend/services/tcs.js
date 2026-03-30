const axios = require("axios");

const BASE_URL_TRACKING = "https://ociconnect.tcscourier.com/tracking/api";

const BEARER_TOKEN = process.env.TCS_BEARER_TOKEN;

async function getToken() {
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
