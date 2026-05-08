require("dotenv").config();
const axios = require("axios");

async function testToken() {
  const POSTEX_TOKEN = process.env.POSTEX_TOKEN;
  console.log("Testing PostEx Token:", POSTEX_TOKEN);
  
  try {
    // Just a basic call to see if we get a 401 or something else
    const response = await axios.get("https://api.postex.pk/services/integration/api/order/v1/track-order/123456", {
      headers: { token: POSTEX_TOKEN }
    });
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("Error Status:", error.response.status);
      console.log("Error Data:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }
}

testToken();
