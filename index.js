import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'

//crear la app
const app = express()

//Habilitando lectura de datos de formularios
app.use(express.urlencoded({extended:true}))

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
app.use('/auth', usuarioRoutes)

//Definir un puerto y arrancar el proyecto
const port = 3000;

app.listen(port,()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});