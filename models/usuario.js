const conexao = require("../conexao");

const usuario = conexao.sequelize.define('usuario', {
	codigo: {
		type: conexao.Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	nome: {
		type: conexao.Sequelize.STRING
	},
	email: {
		type: conexao.Sequelize.STRING
	},
	senha: {
		type: conexao.Sequelize.STRING
	},
	dataNasc: {
		type: conexao.Sequelize.STRING
	}
});

module.exports = usuario;

