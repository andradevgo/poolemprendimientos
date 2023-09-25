import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import emprendimientosRoutes from './routes/emprendimientosRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js'

//crear la app
const app = express()

//Habilitando lectura de datos de formularios
app.use(express.urlencoded({extended:true}))

//Habilitar cookie parser
app.use( cookieParser())

// Habilitar CSRF
app.use( csrf({cookie: true}))

//Conexion base de datos
try{
    await db.authenticate();
    db.sync()
    console.log('Conexión correcta a la base de datos')
}catch (error){
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta pública
app.use(express.static('public'))


//Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)
app.use('/', emprendimientosRoutes)
app.use('/api', apiRoutes)

//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});