function capitalizeFirstLetter(string) {

  if (!string) return "";

  return string.charAt(0).toUpperCase() + string.slice(1);
}

const templates = {
  recoverPassword(name, link) {
    return `
      <p>Hola ${capitalizeFirstLetter(name)},</p>
      <p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p>
      <a href="${link}">Recuperar contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Atte. Equipo civiconecta.cl</p>
    `;
  },
};

module.exports = templates;
