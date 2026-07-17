const { NextRequest, userAgent } = require("next/server");

async function testBug() {
  console.log("1. Creating a mocked NextRequest with a JSON body...");
  const request = new NextRequest("http://localhost/api/test", {
    method: "POST",
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
    body: JSON.stringify({ visitorId: "test-123" })
  });

  try {
    console.log("2. Simulating: await req.json() (Consuming the Request stream)...");
    const body = await request.json();
    console.log("Body parsed successfully:", body);

    console.log("3. Simulating: userAgent(req) (This is where the engine crashes!)...");
    const result = userAgent(request);
    console.log("Result (Should not reach here):", result);
  } catch (error) {
    console.error("\n💥 [CRASH TRIGGERED] 💥");
    console.error(error.name + ": " + error.message);
    if (error.stack) {
      console.error(error.stack.split("\n").slice(0, 4).join("\n"));
    }
  }
}

testBug();
