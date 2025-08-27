// This script is for local testing of the get-cakes-lambda.js function.

// Import the handler function
const { handler } = require('./get-cakes-lambda.js');

// A mock event object, similar to what API Gateway would send.
// For this specific function, the event object isn't used, so an empty object is fine.
const mockEvent = {};

async function runTest() {
  console.log('--- Running Local Lambda Test ---');
  try {
    // Call the handler function with the mock event
    const result = await handler(mockEvent);

    console.log('--- Function Result ---');
    console.log('Status Code:', result.statusCode);
    console.log('Headers:', result.headers);
    
    // Parse and log the body for readability
    console.log('Body:', JSON.parse(result.body));

  } catch (error) {
    console.error('--- Test Failed ---');
    console.error(error);
  }
}

// Execute the test
runTest();
