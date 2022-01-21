var http = require("http");
var url = require("url");

var portInterServer1 = 8090;
var PORT_SERVER_REGISTER = 7000;
var portClient1 = 8000;
var HOST_SERVER_REGISTER = "localhost"; 

var optionRegister = {
  port: PORT_SERVER_REGISTER,
  hostname: HOST_SERVER_REGISTER,
  host: HOST_SERVER_REGISTER + ":" + PORT_SERVER_REGISTER,
  path: "",
  method: "",
};

var username = "";

var messages = {};
var users = []



const isNameExist =  (name)=>{

  
     const user = users.find((element) => element.name == name);

     return user

}

//validation envoie un message 
const validateRequestClient = (user)=>{

   if (!user.name) return "name missed";
   else if (!user.message) return "message missed";
   else {
     const user = checkname(user.name);
     if (user) return user;
   }

   return false;

}

var clientRequestHandler = function(req, res){

  
const headers = {'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin, Content-Type, Accept, Accept-Language, Origin, User-Agent','Access-Control-Allow-Methods': 'GET, POST', 'Content-type': 'application/json',};


if (req.method === "OPTIONS") { res.writeHead(204, headers);
   res.end();
   return; }



  
      console.log(req.method);
    var path = req.url.split('?')[0];
    const chatPath =  path.split("/chat/")
    if(!path || path =='/'){
        res.writeHead(200, headers);
        res.end('{message : "page not found"}');
    }else{
      
        if(req.method == 'GET'){
          

            res.writeHead(200, headers);

            if(path=='/users'){

                optionRegister.path = path
                optionRegister.method = req.method

                const request = http.request(
                  optionRegister,
                  function (response) {
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

                      res.writeHead(200, headers);
                      
                      users = JSON.parse(body)
                      res.end(body);
                    });
                  }
                );

                request.on("error", function (e) {
                  console.log(e);
                  res.writeHead(500, headers);
                  res.end(e);
                });
                req.pipe(request);



            }else {

              const name = path.split("/")[1];
              const isSended = messages[name];
              
                      if (!isSended) {
                        res.end(JSON.stringify([]));
                      } else {
                        const message = JSON.stringify(messages[name]);
                        res.end(message);
                        messages[name] = 0;
                        delete messages[name];
                      }
            }

        }else if(req.method == 'POST'){
   
        if (path == "/register") {
                
               optionRegister.path = path;
               optionRegister.method = req.method;

               const request = http.request(
                 optionRegister,
                 function (response) {
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
                     res.writeHead(200, headers);

                     const result = JSON.parse(body);

                     if (result.name) {
                       name = JSON.parse(body).name;
                     }
                     users = result.users;
                     console.log(result);
                     console.log(users);
                     res.end(body);
                   });
                 }
               );

               request.on("error", function (e) {
                 console.log(e);
                 res.writeHead(500, headers);
                 res.end(e);
               });
               req.pipe(request);
               req
             } else if (path == "/chat") {
               res.writeHead(400, headers);
               res.end('{message : "bad request"}');
             } else if (chatPath && chatPath[1]) {
              
               const user = isNameExist(chatPath[1]);
               if (!user) {
                 res.end("{message : name pas en ligne ou n'existe pas}");
               } else {
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
                     res.end(e);
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
                   res.end(e);
                 });
                 req.pipe(request);
               }
             } else {
               res.writeHead(404, headers);
               res.end('{message : "page not found"}');
             } 

            
           
        } 
          else{
            res.writeHead(404, headers);
            res.end('{message : "page not found"}');
        }
      }
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
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
        res.end(JSON.stringify({ message: "Je suis encore en vie!" }));
      }
      else {
        var body = "";
        res.writeHead(200, headers);
        req.on("data", function (data) {
          body += data.toString();
        });
        req.on("end", function () {
          const object = JSON.parse(body);
          const name = object.name;
          const message = object.message;
          if (!messages[name]) {
            messages[name] = [];
          }
          messages[name].push(message);
          res.end('{status : "ok"}');
        });
      }
    } else {
      res.writeHead(404, headers);
      res.end('{message : "page not found"}');
    }
  }
};


var clientServer = http.createServer(clientRequestHandler);
var interServer = http.createServer(interServerRequestHandler);

clientServer.listen(portClient1);
interServer.listen(portInterServer1);
