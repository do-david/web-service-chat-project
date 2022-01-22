const http = require("http");
var fs = require("fs");
var { Buffer } = require("buffer");


const PORT_SERVER_REGISTER = 7000;
var optionPing = {
  port: "",
  hostname: "",
  host: "",
  path: "/ping",
  method: "POST",
};

const users = [];
const protectedUsers = [];

// sauvegarder les utilisateurs protégés
function CreateFile() {
  try {
    const data = new Uint8Array(Buffer.from(JSON.stringify(protectedUsers)));
    fs.writeFile("users.txt", data, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
  } catch (e) {
    console.log(e);
  }
}
// vérifier si utilisateur existe dèja
const checkname = (name) => {
  const user = users.find((element) => element.name == name);
  if (user) return true;
  return false;
};

// checker les error pour un registre
//ajouter host en requiert
const validateRegisterError = (user) => {
  if (!user.name || !user.port) {
    if (!user.name) return "name missed";

    if (!user.port) return "port missed";
  } else if (user.port) {
    if (typeof user.port != "number") return "port is not a number";
    else {
      if (!Number.isInteger(user.port)) return "port is not an integer";
      else {
        const isUserExist = checkname(user.name);
        if (isUserExist) return "name existe dèja";
      }
    }
  }

  return false;
};

// Heartbeat des clients

const HeartBeatRequest = function () {
  if (users.length > 0) {
    const filteredUsers = users.filter(function (user) {
      return user.isOnline;
    });
    const postData = {
      message: "liste des utilisateurs connectés",
      users: [],
    };
    for (let i = 0; i < filteredUsers.length; i++) {
      const normedUser = {
        name: filteredUsers[i].name,
        port: filteredUsers[i].port,
        host: filteredUsers[i].host,
      };
      postData.users.push(normedUser);
    }
    console.log("filtered data :", postData);
    //Need to update users
    for (let i = 0; i < users.length; i++) {
      //spécificité de chaque utilisateur
      const hostnameClient = users[i].host;
      const portClient = users[i].port;
      const hostClient = `${hostnameClient}:${portClient}`;
      optionPing.hostname = hostnameClient;
      optionPing.port = portClient;
      optionPing.host = hostClient;
      //prépare la requête
      var req = http.request(optionPing, function (res) {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on("end", function () {
          users[i].isOnline = true;
          CreateFile();
        });
        res.on("error", function (e) {
          console.error(`problem with response: ${e.message}`);
        });
      });
      req.on("error", function (e) {
        users[i].isOnline = false;
        console.error(`problem with request: ${e.message}`);
      });
      //envoyer le résultat de la list en post
      req.write(JSON.stringify(postData));
      req.end();
    }
  }
};
//periodicité de 30s
setInterval(HeartBeatRequest, 30000);

// authentification
const Authentification = function () {};

var RegisterServerRequestHandler = function (req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
  };
  var path = req.url.split("?")[0];
  // console.log('url in register',req.url);
  if (!path || path == "/") {
    res.writeHead(404, headers);
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "GET") {
      if (path == "/users") {
        res.writeHead(200, headers);
        res.end(JSON.stringify(users));
      }
    } else if (req.method == "POST") {
      console.log(req.path);
      if (path == "/register") {
        var body = "";
        req.on("data", function (data) {
          body += data.toString();
        });
        req.on("end", function () {
          const user = JSON.parse(body);
          if (user instanceof Object) {
            // user lambda
            if (!user.password) {
              const validate = validateRegisterError(user);

              if (validate) {
                res.writeHead(202, headers);
                res.end(JSON.stringify({ message: validate }));
              } else {
                user["isOnline"] = true;
                users.push(user);
                res.writeHead(201, headers);
                res.end(
                  JSON.stringify({
                    message: "Utilisateur créé sur le registre",
                    users: users,
                  })
                );
              }
            }
            // protected user
            else {
              user["isOnline"] = true;
              protectedUsers.push(user);
              let allUsers = [].concat(users, protectedUsers);
              res.writeHead(201, headers);
              res.end(
                JSON.stringify({
                  message: "Utilisateur protégé créé sur le registre",
                  users: allUsers,
                })
              );
            }
          }
        });
      }
    } else {
      res.writeHead(404, headers);
      res.end('{message : "page not found"}');
    }
  }
};

const server = http.createServer(RegisterServerRequestHandler);

server.listen(PORT_SERVER_REGISTER);
