const http = require('http');
const https = require('https');

const TIME_URL = 'https://time.com';

// Function to fetch HTML content from Time.com
function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('Fetched HTML data:', data);
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to parse HTML and extract latest stories
function extractLatestStories(html, numStories) {
    const storyRegex = /<article.*?<a href="([^"]+)".*?title="([^"]+)"/gs;
    let match;
    let stories = [];
    let count = 1;

    while ((match = storyRegex.exec(html)) !== null && count < numStories) {
        stories.push({
            title: match[2].trim(),
            link: match[1]
        });
        count++;
    }

    console.log('Extracted stories:', stories);
    return stories;
}



// Create HTTP server to serve API
const server = http.createServer(async (req, res) => {
    if (req.url === '/getTimeStories' && req.method === 'GET') {
        try {
            const html = await fetchHTML(TIME_URL);
            const stories = extractLatestStories(html, 6);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stories, null, 2));
        } catch (err) {
            console.error('Error:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
