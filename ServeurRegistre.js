const http = require("http")


const PORT_SERVER_REGISTER = 7000

const users = []

const checkUsername = (username)=>{

    const user = users.find(element=>element.username == username)

    if(user) return true
    
    return false ; 
}

var RegisterServerRequestHandler = function (req, res) {
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, { "Content-type": "application/json" });
    res.end('{message : "page not found"}');
  } else {

    if(req.method == "GET"){

       
        res.end(JSON.stringify(users))

    }
    else if (req.method == "POST") {
       
      var body = "";
      res.writeHead(200, { "Content-type": "application/json" });
      req.on("data", function (data) {
        body += data.toString();
      });
      req.on("end", function () {
        
        const user = JSON.parse(body)
        if(user instanceof Object){
            const isUsernameExist = checkUsername(user.username)
            
            if(isUsernameExist){
                res.end(JSON.stringify({ message: "username existe dèja" }));
            }
            else {
                user.isOnline = true
                users.push(user)
                res.end(JSON.stringify(user));
            }
        }
        else {
            res.end(JSON.stringify({ message: "error data  type " }));
        }

        
      });
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
    }
  }
};

const server = http.createServer(RegisterServerRequestHandler)


server.listen(PORT_SERVER_REGISTER)
