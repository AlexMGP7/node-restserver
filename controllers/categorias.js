const { response } = require("express");
const { Categoria } = require('../models');

const obtenerCategoriaPorId = async (req, res = response) => {
    const { id } = req.params;

    try {
        const categoria = await Categoria.findOne({ _id: id, estado: true })
            .select('-__v')
            .populate('usuario', 'nombre');
            

        if (!categoria) {
            return res.status(404).json({
                msg: 'Categoría no encontrada'
            });
        }

        res.json({
            categoria
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Ocurrió un error al obtener la categoría'
        });
    }
}

const obtenerCategorias = async (req, res = response) => {

    const { limite = 5, desde = 0 } = req.query;

    try {
        const [total, categorias] = await Promise.all([
            Categoria.countDocuments({ estado: true }),
            Categoria.find({ estado: true })
                .select('-__v')
                .populate('usuario', 'nombre') // Agrega los campos que necesitas del categoria
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            categorias,
            total
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Ocurrió un error al obtener las categorías'
        });
    }
}

const crearCategoria = async (req, res = response) => {

    const nombre = req.body.nombre.toUpperCase();
    const categoriaDB = await Categoria.findOne({ nombre });

    if (categoriaDB) {
        return res.status(400).json({
            msg: `La categoria ${categoriaDB.nombre}, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        nombre,
        usuario: req.usuario._id
    }

    const categoria = await new Categoria(data);

    //Guardar en la DB

    await categoria.save();

    res.status(201).json(categoria);

}

//actualizarCategoria

const actualizarCategoria = async (req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data} = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true});

    res.status(201).json(categoria);
};

//borrarCategoria

const borrarCategoria = async (req, res = response) => {

    const { id } = req.params;
    const categoria = await Categoria.findByIdAndUpdate(id, { estado: false }, {new: true});

    res.json({categoria});
}

module.exports = {
    crearCategoria,
    obtenerCategorias,
    obtenerCategoriaPorId,
    actualizarCategoria,
    borrarCategoria
}