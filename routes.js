const express = require('express');
const app = express();
const port = 8081;
const bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:false})
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
const fs = require('fs');
app.use(express.static('public'))

app.get("/" , (req, res) => {
	res.sendFile(__dirname + "/" + "public/inicio.html")
})

app.get("/resenha" , (req, res) => {
	res.sendFile(__dirname + "/" + "public/resenha.html")
})

app.get("/cadResenha", (req, res) => {
    res.sendFile(__dirname + "/"+ "public/adicionar.html")
})

app.post("/cadResenha", urlEncodedParser, (req, res) => {
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

app.post('/buscaResenha',urlEncodedParser, (req,res) => {
    var filme = req.body.filme
    var genero = req.body.genero
    var ano = req.body.ano

    filme = filme.replaceAll(" ","")
	genero = genero.replaceAll(" ", "")
	ano = ano.replaceAll(" ", "")
	

		
	fs.readFile('bd.json','utf8',(erro, texto)=>{
		if (erro)
			throw "Deu algum erro: "+erro;
		var meuBD = JSON.parse(texto);
		var resenhas = meuBD.resenhas;
		
		if(filme.length > 0 && genero == "" && ano == ""){
			var encontrado = resenhas.filter(p =>  p.filme.replaceAll(" ","").toLowerCase().includes(filme.toLowerCase()));
		} 
		if (filme.length > 0 && genero.length > 0 && ano == "") {
			var encontrado = resenhas.filter(p =>  p.filme.replaceAll(" ","").toLowerCase().includes(filme.replaceAll(" ","").toLowerCase()) && p.genero.replaceAll(" ","").toLowerCase().includes(genero.replaceAll(" ","").toLowerCase()));
		}
		if (filme.length > 0 && genero.length > 0 && ano.length > 0) {
			var encontrado = resenhas.filter(p =>  p.filme.replaceAll(" ","").toLowerCase().includes(filme.replaceAll(" ","").toLowerCase()) && p.genero.replaceAll(" ","").toLowerCase().includes(genero.replaceAll(" ","").toLowerCase()) && p.ano.replaceAll(" ","").toLowerCase().includes(ano.replaceAll(" ","").toLowerCase()));
		}
		if (filme == "" && genero.length > 0 && ano.length > 0) {
			var encontrado = resenhas.filter(p =>  p.genero.replaceAll(" ","").toLowerCase().includes(genero.replaceAll(" ","").toLowerCase()) && p.ano.replaceAll(" ","").toLowerCase().includes(ano.replaceAll(" ","").toLowerCase()));
		}
		if (filme.length > 0 && genero == ""  && ano.length > 0) {
			var encontrado = resenhas.filter(p =>  p.filme.replaceAll(" ","").toLowerCase().includes(filme.replaceAll(" ","").toLowerCase()) && p.ano.replaceAll(" ","").toLowerCase().includes(ano.replaceAll(" ","").toLowerCase()));
		}
		
		if (filme == "" && genero.length > 0 && ano == "") {
			var encontrado = resenhas.filter(p =>  p.genero.replaceAll(" ","").toLowerCase().includes(genero.replaceAll(" ","").toLowerCase()));
		}
		
		if (filme == '' && genero == '' && ano.length > 0) {
			var encontrado = resenhas.filter(p => p.ano.replaceAll(" ","").toLowerCase().includes(ano.replaceAll(" ","").toLowerCase()));
		}
		var exibicao = ""
		for(var i=0; i < encontrado.length;i++){
			exibicao+= "\n"
			exibicao+= "Titulo: "+encontrado[i].filme + " ";
			exibicao+= "Resenha: "+encontrado[i].resenha + " ";
			exibicao+= "Genero: "+encontrado[i].genero + " ";
			exibicao+= "Diretor: "+encontrado[i].diretor + " ";
			exibicao+= "Ano: "+encontrado[i].ano +  "\n"
			
		}
		
		res.render(__dirname + "/public/busca-realizada.html", {exibicao:exibicao});
	})
})


app.listen(port, () => {
	console.log(`Esta aplicação está escutando a
	porta ${port}`)
});