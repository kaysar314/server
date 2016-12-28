var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');
httpd.listen(8080);

function handler(req,res) {
    console.log(req.url,req.headers['if-none-match'])
    if(req.headers['if-none-match'] == '3329-141637748dsf4'){

        res.writeHead(304);
        res.end();
    }else{

    fs.readFile(__dirname+'/static/'+(req.url==='/'?'index.html':req.url),
        function (err,data) {
            res.setHeader('Cache-Control',"max-age=50, no-transform, must-revalidate");
            res.setHeader('ETag',"3329-141637748dsf4");
            if(err){
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        }
    );

    }
}