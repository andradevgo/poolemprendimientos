import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  const { email, nombre, token} = datos

  //Enviar el email
  await transport.sendMail({
    from: 'pool.com',
    to: email,
    subject: 'Confima tu cuenta de POOL.com',
    text: 'Confima tu cuenta de POOL.com',
    html: `
    <p> Hola ${nombre}, comprueba tu cuenta en pool.com, apoya o emprende!</p>
    <p> Tu cuenta ya esta lista, solo confirmala en este enlace:
    <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a>

    <p> Si tu no creaste esta cuenta, ignora este mensaje </p>
    `
  })

};

const emailOlvidePassword = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  const { email, nombre, token } = datos

  //Enviar el email
  await transport.sendMail({
    from: 'pool.com',
    to: email,
    subject: 'Restablecer password de cuenta en POOL.com',
    text: 'Confima tu cuenta de POOL.com',
    html: `
    <p> Hola ${nombre}, has solicitado reestablecer tu password en pool.com, apoya o emprende!</p>
    <p> Sigue el siguiente enlace para generar un password:
    <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer password</a>

    <p> Si tu no tienes nada que ver, ignora este mensaje </p>
    `
  })

};

export { emailRegistro, emailOlvidePassword};
