const http = require('http');

const data = JSON.stringify({
    posts: [
        {
            id: "7432015100561104896",
            text: "🚀 Hiring: Freelance WordPress Developer...",
            html: "\n\x3C!---->\n      <span class=\"break-words...",
            postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7432015100561104896",
            timestamp: "2026-02-25T07:44:47.363Z"
        }
    ]
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/scraping/posts',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        // Faking the auth headers
        'X-Extension-Token': 'test_token',
        'Authorization': 'Bearer test_token',
    }
};

const req = http.request(options, (res) => {
    let resData = '';
    res.on('data', (chunk) => {
        resData += chunk;
    });
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${resData}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
