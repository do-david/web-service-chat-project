const http = require("http")


const PORT_SERVER_REGISTER = 7000

const users = []


// vérifier si utilisateur existe dèja 
const checkUsername = (username)=>{

    const user = users.find(element=>element.username == username)

    if(user) return true
    
    return false ; 
}

// checker les error pour un registre 


const validateRegisterError = (user)=>{

     
    
    
    if(!user.username || !user.port ) {

      if(!user.username) return "username missed";

      if(!user.port)  return "port missed";

  
    

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

    return false


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
            const validate = validateRegisterError(user)
            
            if(validate){
                res.end(JSON.stringify({ message: validate }));
            }
            else {
                user.isOnline = true
                users.push(user)
                res.end(JSON.stringify(user));
            }
        }
        else {
            res.end(JSON.stringify({ message: "error data  type : il faut mettre un object avec username et son port" }));
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
