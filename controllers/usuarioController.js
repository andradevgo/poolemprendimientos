import { check, validationResult} from 'express-validator'
import Usuario from '../models/Usuario.js'

const formularioLogin = (req,res)=>{
    res.render('auth/login',{
        pagina : 'Iniciar sesión'
    })
}

const formularioRegistro = (req,res)=>{
    res.render('auth/registro',{
        pagina : 'Crear cuenta'
    })
}

const registrar = async (req,res)=>{
    //Validacion
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req);
    await check('email')
    .notEmpty().withMessage('El email no puede ir vacio')
    .matches(/^[^\s@]+@uptc\.[^\s@]+$/).withMessage('Debe ser un correo de la UPTC')
    .run(req);
    await check('password').isLength({ min: 6}).withMessage('El password debe ser de al menos 6 caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req);

    let resultado = validationResult(req);

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/registro',{
            pagina : 'Crear cuenta',
            errores: resultado.array(),
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    res.json();
    const usuario = await Usuario.create(req.body);
    res.json(usuario);


}

const formularioOlvidePassword = (req,res)=>{
    res.render('auth/olvide-password',{
        pagina : 'Recuperar acceso a POOL'
    })
}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword,
}