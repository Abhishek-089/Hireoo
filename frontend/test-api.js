const http = require('http');

const data = JSON.stringify({
    posts: [
        {
            id: "urn:li:activity:7431939142634127360",
            text: "I am looking for a Freelance Application Developer...",
            html: "<div>I am looking for a Freelance Application Developer...</div>",
            author: {
                name: "Rahul Reddy",
                profileUrl: "",
                headline: ""
            },
            timestamp: "2026-02-24T09:09:09.180Z",
            postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7431939142634127360",
            engagement: { likes: 0, comments: 0, shares: 0 },
            scrapedAt: Date.now(),
            hasHiringKeywords: true
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
        // we need to bypass auth by somehow mocking it or maybe we can't because of auth!
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
