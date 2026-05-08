require("dotenv").config();
const { getTrackingDetail } = require("../services/postex");

async function test() {
  const num = "23383440001277";
  console.log(`Testing Postex tracking number: ${num}`);
  try {
    const result = await getTrackingDetail(num);
    console.log(`Result for ${num}:`, JSON.stringify(result, null, 2));
    
    if (result && result.dist) {
      console.log("\n✅ SUCCESS: System retrieved order details!");
      console.log(`Customer: ${result.dist.customerName}`);
      console.log(`Status: ${result.dist.transactionStatus}`);
    } else {
      console.log("\n❌ FAIL: System did not find this order in PostEx.");
    }
  } catch (err) {
    console.error(`Error for ${num}:`, err.message);
  }
}

test();
