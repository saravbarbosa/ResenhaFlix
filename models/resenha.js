const conexao = require("../conexao")

const resenha = conexao.sequelize.define('resenha', {
	codigo: {
		type: conexao.Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	filme: {
		type: conexao.Sequelize.STRING
	},
	resenha: {
		type: conexao.Sequelize.STRING
	},
	genero: {
		type: conexao.Sequelize.STRING
	},
	diretor: {
		type: conexao.Sequelize.STRING
	},
	ano: {
		type: conexao.Sequelize.STRING
	}
});
module.exports = resenha
