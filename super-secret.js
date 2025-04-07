const crypto = require('crypto');

// Generate a random session secret
const sessionSecret = crypto.randomBytes(64).toString('hex');

// Output the session secret to the terminal
console.log(sessionSecret);