
const Sequelize = require('sequelize')

const sequelize = new Sequelize('resenhaflix', 'root', 'root', {
	host: 'localhost',
	dialect: 'mysql'
})
sequelize.authenticate().then(function () {
	console.log("Conectado!!")
}).catch(function (erro) {
	console.log("Erro ao conectar: " + erro)
})

module.exports = {
	Sequelize:Sequelize,
	sequelize:sequelize
}