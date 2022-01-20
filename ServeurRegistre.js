const http = require("http");

const PORT_SERVER_REGISTER = 7000;
var optionPing = {
  port: "",
  hostname: "",
  host: "",
  path: "/ping",
  method: "POST",
};

const users = [];

// vérifier si utilisateur existe dèja
const checkUsername = (username) => {
  const user = users.find((element) => element.username == username);

  if (user) return true;

  return false;
};

// checker les error pour un registre
//ajouter host en requiert
const validateRegisterError = (user) => {
  if (!user.username || !user.port) {
    if (!user.username) return "username missed";

    if (!user.port) return "port missed";
  } else if (user.port) {
    if (typeof user.port != "number") return "port is not a number";
    else {
      if (!Number.isInteger(user.port)) return "port is not an integer";
      else {
        const isUserExist = checkUsername(user.username);
        if (isUserExist) return "username existe dèja";
      }
    }
  }

  return false;
};

// Heartbeat des clients
const postData = {
  msg: "pending",
  users: undefined,
};

const HeartBeatRequest = function () {
  if (users.length > 0) {
    //Need to update users
    postData.users = [];
    for (let i = 0; i < users.length; i++) {
      //spécificité de chaque utilisateur
      const hostnameClient = users[i].host;
      const portClient = users[i].port;
      const hostClient = `${hostnameClient}:${portClient}`;
      console.log("host of the client is :", { hostClient });
      optionPing.hostname = hostnameClient;
      optionPing.port = portClient;
      optionPing.host = hostClient;
      //prépare la requête
      var req = http.request(optionPing, function (res) {
        res.setEncoding("utf8");
        console.log("add user connected", users[i]);
        res.on("data", (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on("end", function () {
          postData.users.push(users[i]);
        });
        res.on("error", function (e) {
          //CRASH quand le client est mort
          console.error(`problem with request: ${e.message}`);
        });
      });
      req.write(JSON.stringify(postData));
      req.end();
      //envoyer le résultat de la list en post
    }
    postData.msg = "updated";
    console.log('updated list',postData);
    for(let j = 0; j < postData.users.length; j++){
      optionPing.hostname = postData.users[j].host;
      optionPing.port = postData.users[j].port;
      const host = `${postData.users[j].host}:${postData.users[j].port}`;
      console.log('host user =',host);
      optionPing.host = host;
      var req = http.request(optionPing, function(res){
        res.on("error",function (e) {
          console.error(`problem with request: ${e.message}`);
        });
      });
      req.write(JSON.stringify(postData));
      req.end();
    }
  }
};
//periodicité de 30s
setInterval(HeartBeatRequest, 30000);

var RegisterServerRequestHandler = function (req, res) {
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, { "Content-type": "application/json" });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "GET") {
      res.end(JSON.stringify(users));
    } else if (req.method == "POST") {
      var body = "";
      res.writeHead(200, { "Content-type": "application/json" });
      req.on("data", function (data) {
        body += data.toString();
      });
      req.on("end", function () {
        const user = JSON.parse(body);
        if (user instanceof Object) {
          const validate = validateRegisterError(user);

          if (validate) {
            res.end(JSON.stringify({ message: validate }));
          } else {
            user.isOnline = true;
            users.push(user);
            res.end(JSON.stringify(user));
          }
        } else {
          res.end(
            JSON.stringify({
              message:
                "error data  type : il faut mettre un object avec username et son port",
            })
          );
        }
      });
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
    }
  }
};

const server = http.createServer(RegisterServerRequestHandler);

server.listen(PORT_SERVER_REGISTER);
