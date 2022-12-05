function deletar(p) {
    p = p.id.slice(2)
    document.getElementById(p).remove()
}
//CODIGO QUE TRAZ O VALOR PARA O CAMPO
function edita(e) {

    var text = document.getElementById("texto")
    var valo = text.value;

    e = e.id.slice(2)

    var eddie = document.getElementById(e)

    text.value = eddie.textContent.slice(0,-1)

    text.className = e
}

function addText() {

    var text = document.getElementById("texto")
    var valo = text.value;
    if (text.className == "add"){
    var pai = document.body;
        
    var divs = document.getElementsByTagName("div");

    var divDom = document.createElement("div")
    divDom.id = "div" + (divs.length + 1)
    divDom.style = "display: flex; gap: 12px;"


    divDom.innerHTML = '<h3 class="barra">' + valo + '</h3> <a onclick=""><img src="imagens/editar.png" class="editar" onclick="edita(this)" id="aD' + (divDom.id) + '" height="25"></a><a onclick="deletar(this)" id = "aD' + (divDom.id) + '"><img src="imagens/excluir.png" class="excluir" height="27"></a>'

    text.value = ""
    pai.appendChild(divDom);
    } else{
        var idDiv = text.className
        var divEddie = document.getElementById(idDiv)
        divEddie.innerHTML = '<h3 class="barra">' + text.value + '</h3> <a onclick=""><img src="imagens/editar.png" class="editar" onclick="edita(this)" id="aD' + (idDiv) + '" height="25"></a><a onclick="deletar(this)" id = "aD' + (idDiv) + '"><img src="imagens/excluir.png" class="excluir" height="27"></a>'

        pai = document.body
        
        text.className = "add" 
        text.value = ""
                          
    }
};