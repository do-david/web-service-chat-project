var http = require("http");
var url = require("url");

var portInterServer1 = 8090;
var portInterServer2 = 8081;

var portClient1 = 8000;
var portClient2 = 8001;
var PORT_SERVER_REGISTER = 7000;

var host1 = "localhost";
var host2 = "localhost";
var HOST_SERVER_REGISTER = "localhost";

var messages = {};

var optionRegister = {
  port: PORT_SERVER_REGISTER,
  hostname: HOST_SERVER_REGISTER,
  host: HOST_SERVER_REGISTER + ":" + PORT_SERVER_REGISTER,
  path: "",
  method: "",
};

var username = "";

var messages = {};
var users = [];

const isUserNameExist = (username) => {
  const user = users.find((element) => element.username == username);

  return user;
};

var clientRequestHandler = function (req, res) {
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, { "Content-type": "application/json" });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "GET") {
      res.writeHead(200, { "Content-type": "application/json" });
      if (path == "/users") {
        optionRegister.path = path;
        optionRegister.method = req.method;

        const request = http.request(optionRegister, function (response) {
          var body = "";
          response.on("error", function (e) {
            console.log(e);
            res.writeHead(500, {
              "Content-type": "application/json",
            });
            res.end(e);
          });
          response.on("data", function (data) {
            body += data.toString();
          });
          response.on("end", function () {
            res.writeHead(200, {
              "Content-type": "application/json",
            });
            users = JSON.parse(body);
            res.end(body);
          });
        });

        request.on("error", function (e) {
          console.log(e);
          res.writeHead(500, { "Content-type": "application/json" });
          res.end(e);
        });
        req.pipe(request);
      } else {
        const user = isUserNameExist(path.split("/")[1]);

        if (!user) {
          res.end(JSON.stringify([]));
        } else {
          const username = user.username;
          const message = JSON.stringify(messages[username]);
          console.log("message", message);
          res.end(message);
          messages[username] = 0;
          delete messages[username];
        }
      }
    } else if (req.method == "POST") {
      if (path == "/register") {
        optionRegister.path = path;
        optionRegister.method = req.method;

        const request = http.request(optionRegister, function (response) {
          var body = "";
          response.on("error", function (e) {
            console.log(e);
            res.writeHead(500, {
              "Content-type": "application/json",
            });
            res.end(e);
          });
          response.on("data", function (data) {
            body += data.toString();
          });
          response.on("end", function () {
            res.writeHead(200, {
              "Content-type": "application/json",
            });

            if (JSON.parse(body).username) {
              username = JSON.parse(body).username;
            }

            res.end(body);
          });
        });

        request.on("error", function (e) {
          console.log(e);
          res.writeHead(500, { "Content-type": "application/json" });
          res.end(e);
        });
        req.pipe(request);
      } else {
        const user = isUserNameExist(path.split("/")[1]);
        if (!user) {
          res.end("{message : username pas en ligne ou n'existe pas}");
        } else {
          const PORT = user.port;
          var options = {
            port: PORT,
            hostname: host2,
            host: host2 + ":" + PORT,
            path: path,
            method: req.method,
          };
          var request = http.request(options, function (response) {
            var body = "";
            response.on("error", function (e) {
              console.log(e);
              res.writeHead(500, {
                "Content-type": "application/json",
              });
              res.end(e);
            });
            response.on("data", function (data) {
              body += data.toString();
            });
            response.on("end", function () {
              res.writeHead(200, {
                "Content-type": "application/json",
              });

              res.end(body);
            });
          });
          request.on("error", function (e) {
            console.log(e);
            res.writeHead(500, {
              "Content-type": "application/json",
            });
            res.end(e);
          });
          req.pipe(request);
        }
      }
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
    }
  }
};

var interServerRequestHandler = function (req, res) {
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, { "Content-type": "application/json" });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "POST") {
      if (path == "/ping") {
        let body = [];
        req.on("data", (chunk) => {
          body.push(chunk);
        });
        req.on("end", () => {
          const parsedBody = Buffer.concat(body).toString();
          const message = parsedBody.split("=")[1];
          console.log(parsedBody);
          console.log(message);
        });
        console.log(body);
        res.end(JSON.stringify({ message: "I'm alive!" }));
      }
      else {
        //console.log('Msg received from ',portClient1);
        var body = "";
        res.writeHead(200, { "Content-type": "application/json" });
        req.on("data", function (data) {
          body += data.toString();
        });
        req.on("end", function () {
          const object = JSON.parse(body);
          const username = object.username;
          const message = object.message;
          console.log(username);
          console.log(message);
          if (!messages[username]) {
            messages[username] = [];
          }
          messages[username].push(message);
          res.end('{status : "ok"}');
        });
      }
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
    }
  }
};
var clientServer = http.createServer(clientRequestHandler);
var interServer = http.createServer(interServerRequestHandler);
clientServer.listen(portClient2);
interServer.listen(portInterServer2);
