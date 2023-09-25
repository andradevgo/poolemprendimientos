import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Santi',
        email: 'santi@santi.com',
        confirmado: 1,
        password: bcrypt.hashSync('password',10)
    }
]

export default usuarios