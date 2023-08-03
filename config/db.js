import Sequelize from "sequelize";
import dotenv from 'dotenv'
dotenv.config({path:'.env'})

const db = new Sequelize(process.env.BD_NOMBRE,process.env.BD_USER, process.env.BD_PASS,{
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    define:{
        timestamps: true
    },
    //Conexiones nuevas o existentes, maximo por cada usuario
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,//Tiempo de elaborar una conexion
        idle: 10000 //10 segundos para que la conexion se finalice
    },
    operatorAliases: false
});

export default db;