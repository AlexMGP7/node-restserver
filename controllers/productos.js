const { response } = require("express");
const { Producto } = require('../models');

const obtenerProductoPorId = async (req, res = response) => {
    const { id } = req.params;

    try {
        const producto = await Producto.findOne({ _id: id, estado: true })
            .select('-__v')
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre');

        if (!producto) {
            return res.status(404).json({
                msg: 'Producto no encontrado'
            });
        }

        res.json({
            producto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Ocurrió un error al obtener el producto'
        });
    }
}

const obtenerProductos = async (req, res = response) => {

    const { limite = 5, desde = 0 } = req.query;

    try {
        const [total, productos] = await Promise.all([
            Producto.countDocuments({ estado: true }),
            Producto.find({ estado: true })
                .select('-__v')
                .populate('usuario', 'nombre')
                .populate('categoria', 'nombre')
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            productos,
            total
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Ocurrió un error al obtener los productos'
        });
    }

};

const crearProducto = async (req, res = response) => {

    const nombre = req.body.nombre.toUpperCase();
    const productoDB = await Producto.findOne({ nombre });

    if (productoDB) {
        return res.status(400).json({
            msg: `El producto ${productoDB.nombre}, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        nombre,
        usuario: req.usuario._id,
        categoria: req.body.categoria
    }

    // Agregar precio y descripcion si están presentes en el body
    if (req.body.precio) {
        data.precio = req.body.precio;
    }

    if (req.body.descripcion) {
        data.descripcion = req.body.descripcion;
    }

    const producto = await new Producto(data);

    // Guardar en la DB
    await producto.save();

    res.status(201).json(producto);

};

const actualizarProducto = async (req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, categoria, ...data} = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;
    data.categoria = req.body.categoria;

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true});

    res.status(201).json(producto);

};

const borrarProducto = async (req, res = response) => {

    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate(id, { estado: false }, {new: true});

    res.json({producto});

};

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    borrarProducto
}