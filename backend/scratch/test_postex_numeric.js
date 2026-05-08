require("dotenv").config();
const { getTrackingDetail } = require("../services/postex");

async function test() {
  // Sample numeric tracking numbers based on the image (approximated)
  const numbers = [
    "28439123456789", // Placeholder for 2.84E+13
    "29439123456789", // Placeholder for 2.94E+13
  ];

  for (const num of numbers) {
    console.log(`Testing Postex tracking number: ${num}`);
    try {
      const result = await getTrackingDetail(num);
      console.log(`Result for ${num}:`, JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`Error for ${num}:`, err.message);
    }
  }
}

test();
