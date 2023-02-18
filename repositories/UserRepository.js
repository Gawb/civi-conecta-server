const { EntityNotFoundError } = require('./exceptions');
const passwordService = require('../services').password;

const RoleTypes = {
  ADMIN: 'Administrator',
  USER: 'User'
};

class UserRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findOrCreateUser({ name, email }) {
    try {
      const entity = await this.findOneByEmail(email);
      return entity;
    } catch (err) {
      const password = await passwordService.createRandomPassword();
      const entity = await this.createUser({ name, email, password });
      return entity;
    }
  }

  async findOneByEmail(email) {
    const entity = await this.connection.select()
      .from('user')
      .where('email', email)
      .where('active', true)
      .first();

    if (!entity) {
      throw new EntityNotFoundError(`No existe el usuario activo con el correo ${email}`);
    }

    return entity;
  }

  async createAdmin({ email, name, password }) {
    const fields = {
      email,
      name,
      password: passwordService.encrypt(password),
      encrypted_password: true,
      active: true,
      role: RoleTypes.ADMIN
    };

    const [user] = await this.connection.insert(fields, ['*']).into('user');
    return user;
  }

  async createUser({ email, name, password }) {
    const fields = {
      email,
      name,
      password,
      encrypted_password: false,
      active: true,
      role: RoleTypes.USER
    };

    const [user] = await this.connection.insert(fields, ['*']).into('user');
    return user;
  }

  async updatePassword(userId, password) {
    const fields = {
      encrypted_password: true,
      password: passwordService.encrypt(password)
    };

    return this.connection('user')
      .where('id', userId)
      .update(fields);
  }
}

module.exports = UserRepository;
