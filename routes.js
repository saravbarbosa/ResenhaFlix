const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const port = 8081;

const { Op, where } = require("sequelize")

const bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false })

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

const bcrypt = require('bcrypt');
const validaToken = require('./auth')
const jwt = require("jsonwebtoken")
const jwtConfig = require("./config/jwt.js")

const fs = require('fs');

const usuario = require("./models/usuario")
const resenha = require("./models/resenha")

const moment = require("moment")

resenha.sync({ alter: true })
usuario.sync({ alter: true })

app.use(express.static(__dirname + '/public'))

app.locals.userLogado = [0]

app.get("/", (req, res) => {
	app.locals.userLogado = [0]

	res.sendFile(__dirname + "/" + "public/login.html")
})

app.get("/cadUsuario", (req, res) => {
	res.sendFile(__dirname + "/" + "public/cadastro-usuario.html")
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
		where: {
			email: emails
		}
	})

	var err = "usuario já existente"

	if (Existe) {
		res.render(__dirname + "/" + "public/erro.html", { erro: err })
	} else {
		const usuarioss = await usuario.create(user)

		usuarioss.save()

		var ids = await usuario.findOne({
			where: {
				email: emails
			}
		})
		//console.log(ids.codigo, user.email, user.nome)
		token = jwt.sign({ "id": ids.codigo, "email": user.email, "nome": user.nome }, jwtConfig.secret)
	}
	res.redirect("/");
})

app.post("/login", urlEncodedParser, async (req, res) => {

	var usuarioss = await usuario.findOne({
		where: {
			email: req.body.email
		}
	})

	if (usuarioss) {
		const senha_valida = await bcrypt.compare(req.body.senha, usuarioss.senha)

		if (senha_valida) {
			//app.locals.userLogado= {"id":usuarioss.codigo,"email":usuarioss.email,"nome":usuarioss.nome}
			app.locals.userLogado[0] = usuarioss.codigo
			token = jwt.sign({ "id": usuarioss.codigo, "email": usuarioss.email, "nome": usuarioss.nome }, jwtConfig.secret)
			//app.set("UserLogado",userLogado)
			//res.setHeader('authorization', 'Bearer '+ token); 
			//res.header('authorization', 'Bearer '+ token);
			res.redirect("/home")
			//return res.status(200).json({ token : token });
		} else {
			res.render(__dirname + "/" + "public/erro.html", { erro: "senha incorreta" })
		}
	} else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "usuario não cadastrado" })
	}
})

//app.use("*",validaToken)

app.get("/home", (req, res) => {

	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0) {
		res.sendFile(__dirname + "/" + "public/inicio.html")
	}
	else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "faça o login" })
	}
})
app.get("/resenhaDom", (req, res) => {

	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0) {
		res.sendFile(__dirname + "/" + "public/resenha.html")
	}
	else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "faça o login" })
	}

})

app.get("/cadResenha", (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0) {
		res.sendFile(__dirname + "/" + "public/adicionar.html")
	}
	else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "faça o login" })
	}

})

app.post("/Resenha", urlEncodedParser, (req, res) => {

	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0) {
		var id = req.body.id
		var filme = req.body.filme
		var nresenha = req.body.resenha
		var genero = req.body.genero
		var diretor = req.body.diretor
		var ano = req.body.ano

		const rese = {
			filme: filme, resenha: nresenha, genero: genero, diretor: diretor, ano: ano
		}

		const resenhass = resenha.build({
			filme: filme, resenha: nresenha, genero: genero, diretor: diretor, ano: ano
		})

		resenhass.save()

		res.redirect("/home");
	}
	else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "faça o login" })
	}

})

app.get('/buscaResenha', (req, res) => {

	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0) {
		res.sendFile(__dirname + "/" + "/public/buscar.html")
	}
	else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "faça o login" })
	}
});

app.get('/Resenha', async (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0) {

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
				where: {
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
			exibicao += "Ano: " + ub[i].ano + " ";
			exibicao += `<a href="/removerResenha/${ub[i].codigo}">remover</a>` + " ";
			exibicao += `<a href="/editarResenha?id=${ub[i].codigo}">editar</a>`;

			film.push(exibicao)
			exibicao = ""

		}

		res.render(__dirname + "/public/busca-realizada.html", { filme: film });

	}
	else {
		res.render(__dirname + "/" + "public/erro.html", { erro: "faça o login" })
	}

})
app.get("/removerUsuario/:id", (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		const id = req.params.id
		const remove = usuario.destroy({
			where: {
				codigo: id
			}
		})
		if(req.params.id == userLogado){
			res.redirect("/")
		}else{
		res.redirect("/home");
		}
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}
	
})
app.get("/removerResenha/:id", async (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		
		var id = req.params.id
		const remove = await resenha.destroy({
			where: {
				codigo: id
			}
		})
		
		res.redirect("/buscaResenha");
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}
})
app.get("/editarResenha/", async (req, res) => {

	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		var id = req.query.id
	let ub = ""
	const enc = await resenha.findOne({
		where: {
			codigo: id
		}
	})

	ub = enc
	ub = JSON.stringify(ub)
	ub = JSON.parse(ub)
	console.log(ub)

	var filme = ub.filme
	var resenhas = ub.resenha
	var genero = ub.genero
	var diretor = ub.diretor
	var ano = ub.ano


	res.render(__dirname + "/public/editar.html", { 
		filme: filme, 
		resenha: resenhas, 
		genero: genero, 
		diretor: diretor, 
		ano: ano, 
		codigo: id 
	});

	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}

	})

app.post("/editarResenha", async (req, res) => {

	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		var codigos = req.body.codigo
		var filme = req.body.filme
		var nresenha = req.body.resenha
		var genero = req.body.genero
		var diretor = req.body.diretor
		var ano = req.body.ano

		const rese = {
			filme: filme, resenha: nresenha, genero: genero, diretor: diretor, ano: ano
		}

		const acha = await resenha.update(rese, {
			where: {
				codigo: codigos
			}
		})
		res.redirect("/home")
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}

})
app.get("/editarUsuario/", async (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		
		var id = req.query.id
		let ub = ""
		const enc = await usuario.findOne({
			where: {
				codigo: id
			}
		})

		ub = enc
		ub = JSON.stringify(ub)
		ub = JSON.parse(ub)
		console.log(ub)

		var id = ub.codigo
		var nomes = ub.nome
		var emails = ub.email
		var dataN = ub.data

		res.render(__dirname + "/public/editar-usuario.html", { 
			codigo: id, 
			nome: nomes, 
			email: emails, 
			dataNasc: dataN,
			moment: moment });
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}
})
app.post("/editarUsuarios", async (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		
		var id = req.body.codigo
		var nomes = req.body.nome
		var emails = req.body.email
		var dataN = req.body.data

		const us = {
			nome: nomes, email: emails, dataNasc: dataN
		}
		console.log(id)
		const acha = await usuario.update(us, {
			where: {
				codigo: id
			}
		})
		res.redirect("/home")
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}

})
app.get("/buscaUsuarios", async (req, res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		let ub = ''
		const users = await usuario.findAll()
		ub = users
		ub = JSON.stringify(ub)
		ub = JSON.parse(ub)
		console.log(ub)
		us = []
		let exibicao = ''

		for (var i = 0; i < ub.length; i++) {

			exibicao += "nome: " + ub[i].nome + " ";
			exibicao += "email: " + ub[i].email + " ";
			exibicao += "data de nascimento: " + ub[i].dataNasc + " ";
			exibicao += `<a href="/removerUsuario/${ub[i].codigo}">remover</a>` + " ";
			exibicao += `<a href="/editarUsuario?id=${ub[i].codigo}">editar</a>`;

			us.push(exibicao)
			exibicao = ""

		}

		res.render(__dirname + "/public/busca-usuarios.html", { user: us })
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}
})

app.get("/buscaUsuario",async (req,res) => {
	var userLogado = req.app.locals.userLogado
	console.log(userLogado)
	if (userLogado != 0){
		const acha = await usuario.findOne({
			where: {
				codigo: userLogado[0]
			}
		}) 
		ub = acha
		ub = JSON.stringify(ub)
		ub = JSON.parse(ub)
		var nome = ub.nome
		var dataN = ub.dataNasc
		var email = ub.email
		
		res.render(__dirname + "/" + "public/perfil.html", {
			nome: nome, 
			data: dataN, 
			email: email, 
			id: userLogado[0],
			moment: moment
		})
	}
	else{
		res.render(__dirname + "/" + "public/erro.html",{erro: "faça o login"} )
	}
})
app.listen(port, () => {
	console.log(`Esta aplicação está escutando a
	porta ${port}`)
});