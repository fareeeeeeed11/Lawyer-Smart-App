const apiKey = 'AIzaSyCA1utQr88R_mzjH8Jlu3T4KvjAw4zVENg';
const model = 'gemini-1.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function testGemini() {
  try {
    console.log("Testing Gemini API...");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Hello, this is a test." }]
          }
        ]
      })
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    const text = await response.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Network or script error:", err);
  }
}

testGemini();
