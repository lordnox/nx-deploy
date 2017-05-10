
const id = process.env.pm_id || "UNDEF"
const port = process.env.PORT || 3010
const http = require('http')

const blue = port % 2

const requests = {

}

const server = http.createServer((req, res) => {
  console.log(req.url)
  const x = requests[req.url] = ((requests[req.url] || 0) + 1) % 2
  res.writeHead(200, {
    'Content-Type': 'text/html;charset:UTF-8'
  });
  res.write(`<html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-size  : 1000%;
            background : ${blue ? "#ccf" : "#cFc"};
            color      : #000";
          }

          div {
            text-align : center;
            position: absolute;
            top: 50%;
            width : 100%;
            transform: translateY(-50%);
          }
        </style>
      </head>
      <body>
        <div>${x ? '🌹' : '😘'}</div>
      </body>
    </html>
`);
  res.end()
})

server.listen(port, () => {
  console.log(id + ' listening on port ' + port)
})

