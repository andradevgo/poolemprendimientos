import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Precio, Categoria, Emprendimiento, Mensaje, Usuario} from '../models/index.js'
import { esVendedor, formatearFecha } from '../helpers/index.js'

const admin = async (req,res) =>{
    
    //Leer QueryString
    const { pagina: paginaActual } = req.query

    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-emprendimientos?pagina=1')
    }

    try {
        const { id } = req.usuario

        //Limites y offset para el paginador
        const limit = 10;
        const offset = ((paginaActual * limit) - limit)

        const [emprendimientos, total] = await Promise.all([
            Emprendimiento.findAll({
                limit,
                offset,
                where:{
                    usuarioId: id
                },
                include: [
                    { model: Categoria, as: 'categoria'},
                    { model: Precio, as: 'precio'},
                    { model: Mensaje, as: 'mensajes'},
                ],
            }),
            Emprendimiento.count({
                where:{
                  usuarioId : id  
                }
            })
        ])

        res.render('emprendimientos/admin',{
            pagina: 'Mis emprendimientos',
            emprendimientos,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })

    } catch (error) {
        console.log(error)
        
    }
}
// Formulario para crear un nuevo emprendimiento
const crear = async (req,res) => {
    // Consultar Modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('emprendimientos/crear',{
        pagina: 'Crear emprendimiento',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req,res) => {
    //Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        // Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
    
        return res.render('emprendimientos/crear',{
            pagina: 'Crear emprendimiento',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    
    //Crear un registro

    const {titulo, descripcion, precio: precioId, categoria: categoriaId} = req.body

    const { id: usuarioId } = req.usuario

    try {
        const emprendimientoGuardado = await Emprendimiento.create({
            titulo,
            descripcion,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const { id } = emprendimientoGuardado

        res.redirect(`/emprendimientos/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req,res) => {
    
    const { id } = req.params
            
    //Validar que el emprendimiento exista
    const emprendimiento = await Emprendimiento.findByPk(id)

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    //Validar que el emprendimiento no este publicado
    if(emprendimiento.publicado){
        return res.redirect('/mis-emprendimientos')
    }

    //Validar que el emprendimiento pertenece a quin visita esta página
    if(req.usuario.id.toString() !== emprendimiento.usuarioId.toString()){
        return res.redirect('/mis-emprendimientos')
    }

    
    res.render('emprendimientos/agregar-imagen', {
        pagina: `Agregar Imagen: ${emprendimiento.titulo}`,
        csrfToken: req.csrfToken(),
        emprendimiento
    })
}

const almacenarImagen = async (req,res, next) =>{
    const { id } = req.params
            
    //Validar que el emprendimiento exista
    const emprendimiento = await Emprendimiento.findByPk(id)

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    //Validar que el emprendimiento no este publicado
    if(emprendimiento.publicado){
        return res.redirect('/mis-emprendimientos')
    }
 
    //Validar que el emprendimiento pertenece a quin visita esta página
    if(req.usuario.id.toString() !== emprendimiento.usuarioId.toString()){
        return res.redirect('/mis-emprendimientos')
    }

    try {
        // console.log(req.file)
        //Almacenar la imagen y publicar emprendimiento
        emprendimiento.imagen = req.file.filename

        emprendimiento.publicado = 1

        await emprendimiento.save()
        
        next()
        
    } catch (error) {
        console.log(error)
    }
}

const editar = async (req,res) =>{

    const { id } = req.params

    // Validar que el emprendimiento exista

    const emprendimiento = await Emprendimiento.findByPk(id)

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    // Revisar que quien visita la URL, es quien creo el emprendimiento
    if(emprendimiento.usuarioId.toString() !== req.usuario.id.toString() ){
        return res.redirect('/mis-emprendimientos')
    }

    // Consultar Modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('emprendimientos/editar',{
        pagina: `Editar emprendimiento: ${emprendimiento.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: emprendimiento
    })
}

const guardarCambios = async (req,res)=>{

    //Verificar la validación

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        // Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('emprendimientos/editar',{
            pagina: 'Editar emprendimiento',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params

    // Validar que el emprendimiento exista
    const emprendimiento = await Emprendimiento.findByPk(id)

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    // Revisar que quien visita la URL, es quien creo el emprendimiento
    if(emprendimiento.usuarioId.toString() !== req.usuario.id.toString() ){
        return res.redirect('/mis-emprendimientos')
    }


    //Reescribir el objeto y actualizarlo
    try {
        const {titulo, descripcion, precio: precioId, categoria: categoriaId} = req.body

        emprendimiento.set({
            titulo,
            descripcion,
            precioId,
            categoriaId
        })
        
        await emprendimiento.save();

        res.redirect('/mis-emprendimientos')
        
    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req,res) =>{
    
    const { id } = req.params

    // Validar que el emprendimiento exista
    const emprendimiento = await Emprendimiento.findByPk(id)

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    // Revisar que quien visita la URL, es quien creo el emprendimiento
    if(emprendimiento.usuarioId.toString() !== req.usuario.id.toString() ){
        return res.redirect('/mis-emprendimientos')
    }

    //Eliminar la imagen
    await unlink(`public/uploads/${emprendimiento.imagen}`)

    console.log(`Se eliminó la imagen ${emprendimiento.imagen}`)
    
    //Eliminar el emprendimiento
    await emprendimiento.destroy()
    res.redirect('/mis-emprendimientos')

}


// Modifica el estado del emprendimiento

const cambiarEstado = async (req, res) => {
        
    const { id } = req.params

    // Validar que el emprendimiento exista
    const emprendimiento = await Emprendimiento.findByPk(id)

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    // Revisar que quien visita la URL, es quien creo el emprendimiento
    if(emprendimiento.usuarioId.toString() !== req.usuario.id.toString() ){
        return res.redirect('/mis-emprendimientos')
    }
    
    // Actualizar
    emprendimiento.publicado = !emprendimiento.publicado

    await emprendimiento.save()

    res.json({
        resultado: true
    })

}

// Muestra un emprendimiento

const mostrarEmprendimiento = async (req,res)=>{
    const { id } = req.params


    // Comprobar que el emprendimietno exista

    const emprendimiento = await Emprendimiento.findByPk(id, {
        include:[
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
        ]
    })

    if(!emprendimiento || !emprendimiento.publicado){
        return res.redirect('/404')
    }


    res.render('emprendimientos/mostrar',{
        emprendimiento,
        pagina: emprendimiento.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, emprendimiento.usuarioId)
    })
}

const enviarMensaje = async (req ,res )=>{
    const { id } = req.params


    // Comprobar que el emprendimietno exista

    const emprendimiento = await Emprendimiento.findByPk(id, {
        include:[
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
        ]
    })

    if(!emprendimiento){
        return res.redirect('/404')
    }

    // Renderizar los errores
   //Validacion
   let resultado = validationResult(req)

   if(!resultado.isEmpty()){
        
        return res.render('emprendimientos/mostrar',{
            emprendimiento,
            pagina: emprendimiento.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, emprendimiento.usuarioId),
            errores: resultado.array()
        })

    }

    // Almacenar el mensaje

    const { mensaje } = req.body
    const { id: emprendimientoId }= req.params
    const { id: usuarioId }= req.usuario

    await Mensaje.create({
        mensaje,
        emprendimientoId,
        usuarioId
    })

    res.redirect('/')

}

//Leer mensajes recibidos
const verMensajes = async (req,res) =>{
    const { id } = req.params

    // Validar que el emprendimiento exista
    const emprendimiento = await Emprendimiento.findByPk(id,{
        include: [
            { model: Mensaje, as: 'mensajes',
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            },
        ],
    })

    if(!emprendimiento){
        return res.redirect('/mis-emprendimientos')
    }

    // Revisar que quien visita la URL, es quien creo el emprendimiento
    if(emprendimiento.usuarioId.toString() !== req.usuario.id.toString() ){
        return res.redirect('/mis-emprendimientos')
    }

    res.render('emprendimientos/mensajes',{
        pagina: 'Mensajes',
        mensajes: emprendimiento.mensajes,
        formatearFecha
    })

}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarEmprendimiento,
    enviarMensaje,
    verMensajes
}