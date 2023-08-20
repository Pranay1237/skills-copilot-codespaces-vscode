// create web server without npm
// 1. import http module
const http = require('http');
// 2. create a server
const server = http.createServer((req, res) => {
    // 3. send response
    if (req.url === '/') {
        res.write('Hello World');
        res.end();
    }
    if (req.url === '/api/courses') {
        res.write(JSON.stringify([1, 2, 3]));
        res.end();
    }
});
// 4. listen on port 3000
server.listen(3000);
console.log('Listening on port 3000...');