const express = require('express');
const app = express();
const port = 8081;
const { Op, where } = require("sequelize")
const bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false })

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(express.urlencoded({extended: false}));
app.use(express.json())
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const jwtConfig = require("./config/jwt")
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');

const Sequelize = require('sequelize')

const sequelizeInstance = new Sequelize('resenhaFlix', 'root', '258000', {
	host: 'localhost',
	dialect: 'mysql'
})
sequelizeInstance.authenticate().then(function () {
	console.log("Conectado!!")
}).catch(function (erro) {
	console.log("Erro ao conectar: " + erro)
})

const resenha = sequelizeInstance.define('resenha', {
	codigo: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	filme: {
		type: Sequelize.STRING
	},
	resenha: {
		type: Sequelize.STRING
	},
	genero: {
		type: Sequelize.STRING
	},
	diretor: {
		type: Sequelize.STRING
	},
	ano: {
		type: Sequelize.STRING
	}
});
resenha.sync({ alter: true })

const usuario = sequelizeInstance.define('usuario', {
	codigo: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	nome: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	senha: {
		type: Sequelize.STRING
	},
	dataNasc: {
		type: Sequelize.DATE
	}
});

usuario.sync({ alter: true })

app.use(express.static(__dirname + '/public'))

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/" + "public/inicio.html")
})

app.get("/login", (req, res) => {
	res.sendFile(__dirname + "/" + "public/login.html")
})

app.get("/resenhaDom", (req, res) => {
	res.sendFile(__dirname + "/" + "public/resenha.html")
})

app.get("/cadResenha", (req, res) => {
	res.sendFile(__dirname + "/" + "public/adicionar.html")
})

app.post("/Resenha", urlEncodedParser, (req, res) => {
	var id = req.body.id
	var filme = req.body.filme
	var nresenha = req.body.resenha
	var genero = req.body.genero
	var diretor = req.body.diretor
	var ano = req.body.ano
	const rese = {
		filme: filme, resenha: nresenha, genero: genero, diretor: diretor, ano: ano
	}
	if (id != null){
		const resen = resenha.update(rese,{
			where: {
				id: id
			}
		})
	} else {
	const resenhass = resenha.build({
		filme: filme, resenha: nresenha, genero: genero, diretor: diretor, ano: ano
	})
	
	resenhass.save()
   }
	res.redirect("/");
})

app.get("/cadUsuario", (req, res) => {
	res.sendFile(__dirname + "/" + "public/adicionarUsuario.html")
})

app.post("/Usuario", urlEncodedParser, async (req, res) => {
	var id = req.body.id

	var nomes = req.body.nome
	var emails = req.body.email
	
	var dataN = req.body.data

	const salt = await bcrypt.genSalt(10)
	const senhas = await bcrypt.hash(req.body.senha, salt);

	const user = { nome: nomes, email: emails, dataNasc: dataN, senha: senhas }

	const Existe = await usuario.findOne({  
        where:{
            email: emails
        }
    })
	
	var err = "usuario já existente"
	
	if(Existe){
        res.render(__dirname + "/" + "public/erro.html",{erro: err} )
    }else{
	if (id != null) {
		const usuarioss = usuario.update(user, {
			where: {
			 id: id 
			}
		}
		)
		res.redirect("/");
	} else {
	const usuarioss = usuario.build(user)
	usuarioss.save()
	token = jwt.sign({"id":user.id,"email":user.email,"nome":user.nome},jwtConfig.secret)
	res.status(200).json({ token : token });
	}
	res.redirect("/");
}


})


app.get('/buscaResenha', (req, res) => {
	res.sendFile(__dirname + "/" + "/public/buscar.html")
});

app.get('/Resenha', async (req, res) => {
	var filmes = req.query.filme
	var generos = req.query.genero
	var anos = req.query.ano
	let ub = ""


	if (filmes.length > 0 && generos == "" && anos == "") {

		const encontrado = await resenha.findAll({
			where: {
				filme: {
					[Op.substring]: filmes
				}
			}
		})
		ub = encontrado

	};
	if (filmes.length > 0 && generos.length > 0 && anos == "") {
		const encontrado = await resenha.findAll({
			where: {
				filme: {
					[Op.substring]: filmes
				},
				genero: {
					[Op.substring]: generos
				}
			}
		})
		ub = encontrado
	}
	if (filmes.length > 0 && generos.length > 0 && anos.length > 0) {
		const encontrado = await resenha.findAll({
			where: {
				filme: {
					[Op.substring]: filmes
				},
				genero: {
					[Op.substring]: generos
				},
				ano: {
					[Op.substring]: anos

				}

			}
		})
		ub = encontrado

	}
	if (filmes == "" && generos.length > 0 && anos.length > 0) {
		const encontrado = await resenha.findAll({
			where: {

				genero: {
					[Op.substring]: generos
				},
				ano: {
					[Op.substring]: anos

				}

			}
		})
		ub = encontrado

	}
	if (filmes.length > 0 && generos == "" && anos.length > 0) {
		const encontrado = await resenha.findAll({
			where: {
				filme: {
					[Op.substring]: filmes
				},

				ano: {
					[Op.substring]: anos
				}


		}
		
		})
		ub = encontrado
	}
		if (filmes == '' && generos == '' && anos.length > 0) {
			const encontrado = await resenha.findAll({
				where:{
					ano: {
						[Op.substring]: anos
					}
				

			}
		})
		ub = encontrado

	}

	if (filmes == "" && generos.length > 0 && anos == "") {
		const encontrado = await resenha.findAll({

			where: {
				genero: generos
			}
		})
		ub = encontrado

	}

	if (filmes == '' && generos == '' && anos.length > 0) {
		const encontrado = await resenha.findAll({
			where: {
				ano: {
					[Op.substring]: anos

				}

			}
		})
		ub = encontrado
	}

	var exibicao = ""
	var film = []
	ub = JSON.stringify(ub)
	ub = JSON.parse(ub)
	console.log(ub)

	for (var i = 0; i < ub.length; i++) {

		exibicao += "Titulo: " + ub[i].filme + " ";
		exibicao += "Resenha: " + ub[i].resenha + " ";
		exibicao += "Genero: " + ub[i].genero + " ";
		exibicao += "Diretor: " + ub[i].diretor + " ";
		exibicao += "Ano: " + ub[i].ano + ""

		film.push(exibicao)
		exibicao = ""


	}

	res.render(__dirname + "/public/busca-realizada.html", { filme: film });

})
app.get("/removerUsuario",(req,res)=>{
	const id = req.query.id
	const remove = usuario.destroy({
		where:{
			id: id
		}
	}
	)
})
app.get("/removerResenha",(req,res)=>{
	const id = req.query.id
	const remove = resenha.destroy({
		where:{
			id: id
		}
	}
	)
})


app.listen(port, () => {
	console.log(`Esta aplicação está escutando a
	porta ${port}`)
});