const { randomUUID } = require("node:crypto");
const { EntityNotFoundError } = require("./exceptions");
const passwordHelper = require("../helpers/password");
const { RoleTypes } = require("../constants/entities");

class UserRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findOrCreateUser({ name, email, type = RoleTypes.USER }) {
    try {
      const entity = await this.findOneByEmail(email);
      return entity;
    } catch (err) {
      const password = await passwordHelper.createRandomPassword();
      const handlers = {
        [RoleTypes.USER]: this.createTeacher.bind(this),
        [RoleTypes.MANAGER]: this.createManager.bind(this),
        [RoleTypes.ADMIN]: this.createAdmin.bind(this),
      };
      return handlers[type]({ name, email, password });
    }
  }

  async findUserByEmail(email) {

    const sanitizedEmail = email.trim().toLowerCase();

    const entity = await this.connection
      .column({

        id: "user.id",
        name: "user.name",
        email: "user.email",
      })
      .from("user")
      .whereRaw("LOWER(public.user.email) = LOWER(?)", [sanitizedEmail])
      .where("public.user.active", 1)
      .first();


    return entity;
  }

  async findOneByEmail(email) {

    const sanitizedEmail = email.trim().toLowerCase();
    const ref = this.connection.ref.bind(this.connection);

    const entity = await this.connection
      .column({
        id: "public.user.id",
        name: "public.user.name",
        email: "public.user.email",
        role: "public.user.role",
        password: "public.user.password",
        user_active: "public.user.active",
        user_uuid: "public.user.uuid",
        encrypted_password: "public.user.encrypted_password",
        is_custom_planification: "public.user.is_custom_planification",
        is_establishment_active: this.connection.raw(
          "COALESCE(establishment_course.active, establishment_manager_est.active)",
        ),
      })
      .from("public.user")
      .leftJoin("course", "course.teacher_id", "public.user.id")
      .leftJoin(
        ref("establishment").as("establishment_course"),
        "course.establishment_id",
        "establishment_course.id",
      )
      .leftJoin(
        "establishment_manager",
        "establishment_manager.manager_id",
        "public.user.id",
      )
      .leftJoin(
        ref("establishment").as("establishment_manager_est"),
        "establishment_manager.establishment_id",
        "establishment_manager_est.id",
      )
      .whereRaw("LOWER(public.user.email) = LOWER(?)", [email])
      .where("public.user.active", 1)
      .first();

    if (!entity) {
      throw new EntityNotFoundError(
        `No existe el usuario activo con el correo ${sanitizedEmail}`,
      );

    }
  
    return entity;
  }

  createAdmin({ email, name, password }) {
    return this._createUser({
      email,
      name,
      password: passwordHelper.encrypt(password),
      role: RoleTypes.ADMIN,
      encription: 1,
    });
  }

  createManager({ email, name, password }) {
    return this._createUser({
      email,
      name,
      password,
      role: RoleTypes.MANAGER,
      encription: 0,
    });
  }

  createTeacher({ email, name, password }) {
    return this._createUser({
      email,
      name,
      password,
      role: RoleTypes.USER,
      encription: 0,
    });
  }

  async _createUser({ email, name, password, role, encription }) {
    const fields = {
      uuid: randomUUID(),
      email,
      name,
      password,
      encrypted_password: encription,
      active: 1,
      role,
    };

    const [user] = await this.connection
      .insert(fields, ["*"])
      .into("public.user");
    return user;
  }

  async updatePassword(userId, password) {
    const user = await this.connection

      .select("role", "recovery_token")
      .from("public.user")
      .where("id", userId)
      .first();

    if (!user) {
      throw new EntityNotFoundError(`No existe el usuario con el ID ${userId}`);
    }

    const hashedPassword =
      user.role === RoleTypes.ADMIN
        ? passwordHelper.encrypt(password)
        : password;

    const fields = {
      password: hashedPassword,
      encrypted_password: user.role === RoleTypes.ADMIN ? 1 : 0,
      updated_at: new Date(),
      recovery_token: null,
      recovery_token_expiration: null,
    };

    return this.connection("public.user").where("id", userId).update(fields);
  }

  findByAlias(uuid) {
    return this.connection
      .select()
      .from("public.user")
      .where("uuid", uuid)
      .first();
  }

  async storeRecoveryToken(userId, recoveryToken, tokenExpiration) {
    const fields = {
      recovery_token: recoveryToken,
      recovery_token_expiration: tokenExpiration,
    };


    return this.connection("public.user").where("id", userId).update(fields);

  }

  findOneByRecoveryToken = async (token) => {
    const entity = await this.connection
      .column({

        id: "public.user.id",
        name: "public.user.name",
        email: "public.user.email",
        recovery_token_expiration: "public.user.recovery_token_expiration",
      })
      .from("public.user")
      .where("public.user.recovery_token", token)

      .first();

    return entity;
  };

  findByFeedbackCourseUUID(uuid) {
    return this.connection
      .select("public.user.*")
      .from("public.user")
      .innerJoin("course", "user.id", "course.teacher_id")
      .innerJoin("feedback_course", "feedback_course.course_id", "course.id")
      .where("feedback_course.uuid", uuid)
      .first();
  }

  updateCustomPlanification(id) {
    return this.connection("public.user")
      .where("id", id)
      .update("is_custom_planification", 1);
  }

  findByCourse(courseId) {
    return this.connection
      .select()
      .from("public.user")
      .innerJoin("course", "course.teacher_id", "user.id")
      .where("course.id", courseId)
      .first();
  }
}

module.exports = UserRepository;
