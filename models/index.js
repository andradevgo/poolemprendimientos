import Emprendimiento from './Emprendimiento.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'
import Mensaje from './Mensaje.js'

Emprendimiento.belongsTo(Precio, {foreignKey: 'precioId'})
Emprendimiento.belongsTo(Categoria, {foreignKey: 'categoriaId'})
Emprendimiento.belongsTo(Usuario, {foreignKey: 'usuarioId'})
Emprendimiento.hasMany(Mensaje, { foreignKey: 'emprendimientoId'})

Mensaje.belongsTo(Emprendimiento, { foreignKey: 'emprendimientoId'})
Mensaje.belongsTo(Usuario, { foreignKey: 'usuarioId'})

export{
    Emprendimiento,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}