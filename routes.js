const express = require('express');
const app = express();
const port = 8081;
const bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:false})

// const sequelize = require('sequelize')
// const sequelizeInstance = new sequelize('lojinha', 'root', 'aluno',{
// 	host: 'localhost',
// 	dialect: 'mysql'
// });

// sequelizeInstance.authenticate().then( function() {
// 	console.log("conectado")
// }).catch(function(erro){
// 	console.log(erro)
// })

// const Produto = sequelizeInstance.define('produto',{
// 	codigo: {
// 		type: sequelize.STRING
// 	},
// 	nome: {
// 		type: sequelize.STRING
// 	},
// 	marca: {
// 		type: sequelize.STRING
// 	},
// 	preco: {
// 		type: sequelize.DOUBLE
// 	},
// }
// )

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

const fs = require('fs');

app.use(express.static(__dirname +'/public'))

app.get("/" , (req, res) => {
	res.sendFile(__dirname + "/" + "public/inicio.html")
})

app.get("/resenhaDom" , (req, res) => {
	res.sendFile(__dirname + "/" + "public/resenha.html")
})

app.get("/cadResenha", (req, res) => {
    res.sendFile(__dirname + "/"+ "public/adicionar.html")
})

app.post("/Resenha", urlEncodedParser, (req, res) => {
    var filme = req.body.filme
    var resenha = req.body.resenha
    var genero = req.body.genero
	var diretor = req.body.diretor
    var ano = req.body.ano
    var id = 0

    var resenhas = {id: id,filme: filme, resenha: resenha, genero: genero, diretor: diretor, ano: ano}

    fs.readFile('bd.json','utf8',(erro, texto)=>{
        console.log(texto)
		if (erro)
			throw "Deu algum erro: "+erro;
		
		var meuBD = JSON.parse(texto);
         
        resenhas.id = parseInt(meuBD.resenhas.length) + 1 
        
		meuBD.resenhas.push(resenhas);
		
		var meuBDString = JSON.stringify(meuBD);
		console.log(meuBDString);
		
		fs.writeFile('bd.json',meuBDString,(erro)=>{
			if (erro){
				throw "Deu algum erro: "+erro;
			}
			else{
				res.redirect("/");
			}
		});
    })
})

app.get('/buscaResenha',(req,res)=>{
    res.sendFile(__dirname +"/"+"/public/buscar.html")
});

app.get('/Resenha', (req,res) => {
	
    var filme = req.query.filme
    var genero = req.query.genero
    var ano = req.query.ano

    filme = filme
	genero = genero
	ano = ano
	
	fs.readFile('bd.json','utf8',(erro, texto)=>{
		
		if (erro)
			throw "Deu algum erro: "+erro;
		
		var meuBD = JSON.parse(texto);
		var resenhas = meuBD.resenhas;
		
		if(filme.length > 0 && genero == "" && ano == ""){
			var encontrado = resenhas.filter(p =>  p.filme.toLowerCase().includes(filme.toLowerCase()));
		} 
		if (filme.length > 0 && genero.length > 0 && ano == "") {
			var encontrado = resenhas.filter(p =>  p.filme.toLowerCase().includes(filme.toLowerCase()) || p.genero.toLowerCase().includes(genero.toLowerCase()));
		}
		if (filme.length > 0 && genero.length > 0 && ano.length > 0) {
			var encontrado = resenhas.filter(p =>  p.filme.toLowerCase().includes(filme.toLowerCase()) || p.genero.toLowerCase().includes(genero.toLowerCase()) || p.ano.toLowerCase().includes(ano.toLowerCase()));
		}
		if (filme == "" && genero.length > 0 && ano.length > 0) {
			var encontrado = resenhas.filter(p =>  p.genero.toLowerCase().includes(genero.toLowerCase()) || p.ano.toLowerCase().includes(ano.toLowerCase()));
		}
		if (filme.length > 0 && genero == ""  && ano.length > 0) {
			var encontrado = resenhas.filter(p =>  p.filme.toLowerCase().includes(filme.toLowerCase()) && p.ano.toLowerCase().includes(ano.toLowerCase()));
		}
		
		if (filme == "" && genero.length > 0 && ano == "") {
			var encontrado = resenhas.filter(p =>  p.genero.toLowerCase().includes(genero.toLowerCase()));
		}
		if (filme == '' && genero == '' && ano.length > 0) {
			var encontrado = resenhas.filter(p => p.ano.toLowerCase().includes(ano.toLowerCase()));
		}

		console.log(encontrado)

		var exibicao = ""
		var filmes = []

		for(var i=0; i < encontrado.length;i++){
			
			exibicao+= "Titulo: "+encontrado[i].filme + " ";
			exibicao+= "Resenha: "+encontrado[i].resenha + " ";
			exibicao+= "Genero: "+encontrado[i].genero + " ";
			exibicao+= "Diretor: "+encontrado[i].diretor + " ";
			exibicao+= "Ano: "+encontrado[i].ano +  ""

			filmes.push(exibicao)
			exibicao = ""
		}
		
		res.render(__dirname + "/public/busca-realizada.html",  {filme :filmes});
	})
})


app.listen(port, () => {
	console.log(`Esta aplicação está escutando a
	porta ${port}`)
});