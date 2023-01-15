const jwt = require("jsonwebtoken")
const jwtConfig = require("./config/jwt")
const dotenv = require('dotenv');
dotenv.config()
const usuario = require("./models/usuario")

 async function validaToken(req,res, next){
    try {
        let token = req.headers['authorization'].split(" ")[1];
       
        let decoded = jwt.verify(token,jwtConfig.secret);
        usuarioss = decoded;
        
        let Usuario =  await usuario.findOne(
          {where:{email : usuarioss.email},attributes:{exclude:["senha"]}
        });
        if(Usuario === null){
          res.status(404).json({'msg':"Usuário não encontrado!"});
        }
      } catch(err){
        res.status(401).json({"msg":"Não foi possível autenticar!"});
      }
        
}

module.exports=validaToken
