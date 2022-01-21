const http = require("http")


const PORT_SERVER_REGISTER = 7000

const users = []


// vérifier si utilisateur existe dèja 
const checkName = (name)=>{

    const user = users.find(element=>element.name == name)

    if(user) return true
    
    return false ; 
}

// checker les error pour un registre 


const validateRegisterError = (user)=>{

     
    
    
    if(!user.name || !user.port ) {

      if(!user.name) return "name missed";

      if(!user.port)  return "port missed";

  
    

    } else if (user.port) {
      if (typeof user.port != "number") return "port is not a number";
      else {
        if (!Number.isInteger(user.port)) return "port is not an integer";
        else {
          const isUserExist = checkName(user.name);
          if (isUserExist) return "name existe dèja";
        }
      
    }
    } 

    return false


}

var RegisterServerRequestHandler = function (req, res) {

   const headers = {
     "Access-Control-Allow-Origin": "*",
     "Content-type": "application/json",
   };
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, headers);
    res.end('{message : "page not found"}');
  } else {

    if(req.method == "GET"){

       
        res.end(JSON.stringify(users))

    }
    else if (req.method == "POST") {
       
      var body = "";
      
      req.on("data", function (data) {
        body += data.toString();
      });
      req.on("end", function () {
        
        const user = JSON.parse(body)
        if(user instanceof Object){
            const validate = validateRegisterError(user)
            
            if(validate){
              res.writeHead(200, headers);
                res.end(JSON.stringify({ message: validate }));
            }
            else {
                user["isOnline"] = true;
                users.push(user)
                res.writeHead(200, headers);
                res.end(JSON.stringify({message :"OK" , users : users}));
            }
        }
        else {
            res.end(JSON.stringify({ message: "error data  type : il faut mettre un object avec name et son port" }));
        }

        
      });
    } else {
      res.writeHead(404, headers);
      res.end('{message : "page not found"}');
    }
  }
};




const server = http.createServer(RegisterServerRequestHandler)


server.listen(PORT_SERVER_REGISTER)
