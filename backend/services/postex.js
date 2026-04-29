const axios = require("axios");

const BASE_URL_TRACKING = "https://api.postex.pk/services/integration/api/order/v1/track-order";
const POSTEX_TOKEN = process.env.POSTEX_TOKEN;

async function getTrackingDetail(trackingNumber) {
  try {
    const response = await axios.get(`${BASE_URL_TRACKING}/${trackingNumber}`, {
      headers: {
        token: POSTEX_TOKEN
      }
    });

    // The successful response has statusCode "200" inside the body
    if (response.data && response.data.statusCode !== "200") {
      return { status: "FAIL", message: response.data.statusMessage };
    }

    return response.data;
  } catch (error) {
    console.error(`Error tracking PostEx consignment ${trackingNumber}:`, error.message);
    
    // Normalize 404 or bad requests to a "FAIL" status to match TCS error handling
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      return { status: "FAIL", message: "Order Not Found" };
    }
    
    throw error;
  }
}

module.exports = {
  getTrackingDetail
};
