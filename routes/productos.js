const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, esAdminRole} = require('../middlewares');
const { crearProducto, 
        obtenerProductos, 
        obtenerProductoPorId, 
        actualizarProducto, 
        borrarProducto } = require('../controllers/productos');
const { existeProductoPorId, existeCategoriaPorId } = require('../helpers/db-validators');

const router = Router();

// Obtener todas las Productos - publico
router.get("/", obtenerProductos);

// Obtener una Producto por id - publico
router.get("/:id",[
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], obtenerProductoPorId);

// Crear Producto - privado - token valido
router.post("/", [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'No es un id de mongo').isMongoId(),
    check('categoria').custom(existeCategoriaPorId),
    validarCampos
], crearProducto);

//Actualizar - privado - cualquiera con token valido
router.put("/:id", [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    check('nombre','El nombre es obligatorio').not().isEmpty(),
    validarCampos
], actualizarProducto);

// Borrar una Producto - Admin
router.delete("/:id", [
    validarJWT,
    esAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], borrarProducto);

module.exports = router;