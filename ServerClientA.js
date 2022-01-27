var http = require("http");

// LES PORTS
var portInterServer1 = 8090;
var PORT_SERVER_REGISTER = 1337;
var portClient1 = 8000;

// LES HOSTS
var HOST_SERVER_REGISTER = "localhost";

// option pour communiquer avec le serveur registre
var optionRegister = {
  port: PORT_SERVER_REGISTER,
  hostname: HOST_SERVER_REGISTER,
  host: HOST_SERVER_REGISTER + ":" + PORT_SERVER_REGISTER,
  path: "",
  method: "",
};

var messages = {};
var users = [];
var messagesWithTime = {};

//  check si un name existe dans la liste des utilisateurs
const isNameExist = (name) => {
  const user = users.find((element) => element.name == name);

  return user;
};

var clientRequestHandler = function (req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Access-Control-Allow-Origin, Content-Type, Accept, Accept-Language, Origin, User-Agent ,from",
    "Access-Control-Allow-Methods": "GET, POST",
    "Content-type": "application/json",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  var path = req.url.split("?")[0];
  const chatPath = path.split("/chat/");
  const timePath = path.split("/time/");

  if (!path || path == "/") {
    res.writeHead(200, headers);
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "GET") {
      if (path == "/users") {
        optionRegister.path = path;
        optionRegister.method = req.method;

        const request = http.request(optionRegister, function (response) {
          var body = "";
          response.on("error", function (e) {
            console.log(e);
            res.writeHead(404, headers);
            res.end(e);
          });
          response.on("data", function (data) {
            body += data.toString();
          });
          response.on("end", function () {
            res.writeHead(200, headers);

            users = JSON.parse(body);
            res.end(body);
          });
        });

        request.on("error", function (e) {
          console.log(e);
          res.writeHead(500, headers);
          res.end("{message : erreur serveur}");
        });

        req.pipe(request);
      } else if (timePath && timePath[1]) {
        res.writeHead(200, headers);
        const name = timePath[1];
        const isSended = messagesWithTime[name];
        if (!isSended) {
          res.end(JSON.stringify([]));
        } else {
          res.end(JSON.stringify(messagesWithTime[name]));
        }
      } else {
        res.writeHead(200, headers);
        const name = path.split("/")[1];
        const isSended = messages[name];

        if (!isSended) {
          res.end(JSON.stringify([]));
        } else {
          const message = JSON.stringify(messages[name]);
          res.end(message);
        }
      }
    } else if (req.method == "POST") {
      console.log('path',path);
      if (path == "/register") {
        optionRegister.path = path;
        optionRegister.method = req.method;

        const request = http.request(optionRegister, function (response) {
          var body = "";
          response.on("error", function (e) {
            console.log(e);
            res.writeHead(500, headers);
            res.end(e);
          });
          response.on("data", function (data) {
            body += data.toString();
          });
          response.on("end", function () {
            res.writeHead(response.statusCode, headers);
            const result = JSON.parse(body);
            users = result.users;
            res.end(body);
          });
        });

        request.on("error", function (e) {
          console.log(e);
          res.writeHead(500, headers);
          res.end("{message : erreur serveur}");
        });
        req.pipe(request);
        req;
      } else if (path == "/chat") {
        res.writeHead(400, headers);
        res.end('{message : "malformation de requête"}');
      } else if (chatPath && chatPath[1]) {
        const user = isNameExist(chatPath[1]);
        const from = req.headers["from"];
        if (!user) {
          res.end("{message : utilisateur non connecté ou n'existe pas}");
        } else if (!from) {
          res.end("{message : il faut ajouter le header from }");
        } else {
          // res.writeHead(200, headers);
          const PORT = user.port;
          const HOST = user.host;
          var options = {
            port: PORT,
            hostname: HOST,
            host: HOST + ":" + PORT,
            path: path,
            method: req.method,
          };
          var request = http.request(options, function (response) {
            var body = "";
            response.on("error", function (e) {
              console.log(e);
              res.writeHead(500, headers);
              res.end("{message : erreur serveur}");
            });
            response.on("data", function (data) {
              body += data.toString();
            });
            response.on("end", function () {
              res.writeHead(200, headers);

              res.end(body);
            });
          });
          request.on("error", function (e) {
            console.log(e);
            res.writeHead(500, headers);
            res.end("{message : 'erreur serveur'}");
          });
          request.setHeader("from", from);
          req.pipe(request);
        }
      } else {
        res.writeHead(404, headers);
        res.end('{message : "ressource introuvable"}');
      }
    } else {
      res.writeHead(404, headers);
      res.end('{message : "ressource introuvable"}');
    }
  }
};
var interServerRequestHandler = function (req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
  };
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, headers);
    res.end('{message : "ressource introuvable"}');
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
        res.end(JSON.stringify({ message: "Je suis encore en vie!" }));
      } else {
        var body = "";
        res.writeHead(200, headers);
        req.on("data", function (data) {
          body += data.toString();
        });
        req.on("end", function () {
          const message = body;
          const name = req.headers["from"];
          // ajout du times dans un autre objet avec times
          if (!messagesWithTime[name]) {
            messagesWithTime[name] = [];
          }
          messagesWithTime[name].push({
            time: Date.now(),
            message: message,
          });

          // ajout des messages dans l'objet messages
          if (!messages[name]) {
            messages[name] = [];
          }
          messages[name].push(message);
          res.end('{status : "ok"}');
        });
      }
    } else {
      res.writeHead(404, headers);
      res.end('{message : "ressource introuvable"}');
    }
  }
};

var clientServer = http.createServer(clientRequestHandler);
var interServer = http.createServer(interServerRequestHandler);

clientServer.listen(portClient1);
interServer.listen(portInterServer1);
