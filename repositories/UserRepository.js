const uuid = require('uuid');
const { EntityNotFoundError } = require('./exceptions');
const passwordHelper = require('../helpers/password');
const { RoleTypes } = require('../constants/entities');

class UserRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findOrCreateUser({ name, email }) {
    try {
      const entity = await this.findOneByEmail(email);
      return entity;
    } catch (err) {
      const password = await passwordHelper.createRandomPassword();
      const entity = await this.createUser({ name, email, password });
      return entity;
    }
  }

  async findUserByEmail(email) {

    const sanitizedEmail = email.trim().toLowerCase();

    const entity = await this.connection
      .column({
        id: 'user.id',
        name: 'user.name',
        email: 'user.email',
      })
      .from('user')
      .whereRaw('LOWER(public.user.email) = LOWER(?)', [sanitizedEmail])
      .where('public.user.active', 1)
      .first();

    return entity;
  }

  async findOneByEmail(email) {

    const sanitizedEmail = email.trim().toLowerCase();
  
    const entity = await this.connection
      .column({
        id: 'public.user.id',
        name: 'public.user.name',
        email: 'public.user.email',
        role: 'public.user.role',
        password: 'public.user.password',
        user_active: 'public.user.active',
        user_uuid: 'public.user.uuid',
        encrypted_password: 'public.user.encrypted_password',
        is_custom_planification: 'public.user.is_custom_planification',
        is_establishment_active: 'establishment.active',
      })
      .from('public.user')
      .leftJoin('course', 'course.teacher_id', 'public.user.id')
      .leftJoin('establishment', 'course.establishment_id', 'establishment.id')
      .whereRaw('LOWER(public.user.email) = LOWER(?)', [sanitizedEmail])
      .where('public.user.active', 1)
      .first();

    if (!entity) {
      throw new EntityNotFoundError(`No existe el usuario activo con el correo ${sanitizedEmail}`);
    }
  
    return entity;
  }

  async createAdmin({ email, name, password }) {
    const fields = {
      uuid: uuid.v4(),
      email,
      name,
      password: passwordHelper.encrypt(password),
      encrypted_password: 1,
      active: 1,
      role: RoleTypes.ADMIN
    };

    const [user] = await this.connection.insert(fields, ['*']).into('user');
    return user;
  }

  async createUser({ email, name, password }) {
    const fields = {
      uuid: uuid.v4(),
      email,
      name,
      password,
      encrypted_password: 0,
      active: 1,
      role: RoleTypes.USER
    };

    const [user] = await this.connection.insert(fields, ['*']).into('user');
    return user;
  }

  async updatePassword(userId, password) {
    const user = await this.connection
      .select('role', 'recovery_token')
      .from('user')
      .where('id', userId)
      .first();
  
    if (!user) {
      throw new EntityNotFoundError(`No existe el usuario con el ID ${userId}`);
    }
  
    const hashedPassword = user.role === RoleTypes.ADMIN
      ? passwordHelper.encrypt(password)
      : password;
    const fields = {
      password: hashedPassword,
      encrypted_password: user.role === RoleTypes.ADMIN ? 1 : 0,
      updated_at: new Date(),
      recovery_token: null,
      recovery_token_expiration: null,
    };

    return this.connection('user')
      .where('id', userId)
      .update(fields);
  }

  findByAlias(uuid) {
    return this.connection
      .select()
      .from('user')
      .where('uuid', uuid)
      .first();
  }

  async storeRecoveryToken(userId, recoveryToken, tokenExpiration) {
    const fields = {
      recovery_token: recoveryToken,
      recovery_token_expiration: tokenExpiration,
    };

    return this.connection('user')
      .where('id', userId)
      .update(fields);
  }

  findOneByRecoveryToken = async (token) => {
    const entity = await this.connection
      .column({
        id: 'public.user.id',
        name: 'public.user.name',
        email: 'public.user.email',
        recovery_token_expiration: 'public.user.recovery_token_expiration',
      })
      .from('public.user')
      .where('public.user.recovery_token', token)
      .first();

    return entity;
  };

  findByFeedbackCourseUUID(uuid) {
    return this.connection
      .select('user.*')
      .from('user')
      .innerJoin('course', 'user.id', 'course.teacher_id')
      .innerJoin('feedback_course','feedback_course.course_id', 'course.id')
      .where('feedback_course.uuid', uuid)
      .first();
  }

  updateCustomPlanification(id) {
    return this.connection('user')
      .where('id', id)
      .update('is_custom_planification', 1);
  }

  findByCourse(courseId) {
    return this.connection
      .select()
      .from('user')
      .innerJoin('course', 'course.teacher_id', 'user.id')
      .where('course.id', courseId)
      .first();
  }
}

module.exports = UserRepository;
