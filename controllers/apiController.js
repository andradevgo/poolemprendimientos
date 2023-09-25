import { Emprendimiento, Precio, Categoria } from '../models/index.js'

const emprendimientos = async (req,res) => {
    
    const emprendimientos = await Emprendimiento.findAll({
            include:[
                {model: Precio, as: 'precio'},
                {model: Categoria, as: 'categoria'},
            ]
    })

    res.json(emprendimientos)
}

export{
    emprendimientos
}