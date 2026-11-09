const { Perfil } = require('../models');

// GET /api/perfiles
const listar = async (_req, res) => res.status(200).json(await Perfil.findAll({ order: [['id', 'ASC']] }));

module.exports = { listar };
