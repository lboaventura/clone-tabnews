import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  const storedUser = await findUserByEmail(providedEmail);
  await validatePassword(providedPassword, storedUser.password);

  return storedUser;

  async function findUserByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw getGenericAuthenticationError();
      }

      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw getGenericAuthenticationError();
    }
  }

  function getGenericAuthenticationError() {
    return new UnauthorizedError({
      message: "Dados de autenticação não conferem.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
