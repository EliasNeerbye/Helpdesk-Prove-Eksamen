const crypto = require('crypto');

// Generate a random session secret
const sessionSecret = crypto.randomBytes(128).toString('base64url');

// Output the session secret to the terminal
console.log(sessionSecret);