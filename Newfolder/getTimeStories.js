const http = require('http');
const https = require('https');
const cheerio = require('cheerio'); // Added Cheerio

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
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to parse HTML and extract latest stories
function extractLatestStories(html) {
    try {
        const $ = cheerio.load(html);
        const stories = [];

        $('div.partial.latest-stories ul li').each((index, element) => {
            const title = $(element).find('h3.latest-stories__item-headline').text().trim();
            const link = $(element).find('a').attr('href');
            if (title && link) {
                stories.push({ title, link });
            }
        });

        return stories;
    } catch (error) {
        throw error;
    }
}

// Create HTTP server to serve API
const server = http.createServer(async (req, res) => {
    if (req.url === '/getTimeStories' && req.method === 'GET') {
        try {
            const html = await fetchHTML(TIME_URL);
            const stories = extractLatestStories(html);

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
