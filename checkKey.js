require('dotenv').config();

const apiKey = process.env.OPENROUTER_API_KEY;
console.log("API Key is set:", !!apiKey);  // prints true if key exists
