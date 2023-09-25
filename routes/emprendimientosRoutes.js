import express from "express"
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarEmprendimiento, enviarMensaje, verMensajes} from '../controllers/emprendimientoController.js'
import protegerRuta from "../middleware/protegerRuta.js"
import upload from "../middleware/subirImagen.js"
import identificarUsuario from "../middleware/identificarUsuario.js"

const router = express.Router()


router.get('/mis-emprendimientos', protegerRuta, admin)
router.get('/emprendimientos/crear', protegerRuta, crear)
router.post('/emprendimientos/crear', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es Obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion no puede ir vacia').isLength({max: 200}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    guardar
)

router.get('/emprendimientos/agregar-imagen/:id', 
    protegerRuta,
    agregarImagen
)

router.post('/emprendimientos/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/emprendimientos/editar/:id',
    protegerRuta,
    editar
)

router.post('/emprendimientos/editar/:id', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es Obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion no puede ir vacia').isLength({max: 200}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    guardarCambios
)

router.post('/emprendimientos/eliminar/:id',
    protegerRuta,
    eliminar
)

router.put('/emprendimientos/:id',
    protegerRuta,
    cambiarEstado
)

//Area publica
router.get('/emprendimiento/:id',
    identificarUsuario,
    mostrarEmprendimiento
)

// Almacenar los mensajes
router.post('/emprendimiento/:id',
    identificarUsuario,
    body('mensaje').isLength({min:10}).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)

export default router