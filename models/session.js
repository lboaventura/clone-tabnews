import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRATION_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function findOneValidByToken(token) {
  const sessionFound = await runSelectQuery(token);
  return sessionFound;

  async function runSelectQuery(token) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM 
          sessions
        WHERE
          token = $1
          AND expires_at > now()
        LIMIT
          1
      ;`,
      values: [token],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se esse usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renew(id) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const renewedSessionObject = await runUpdateQuery(id, expiresAt);
  return renewedSessionObject;

  async function runUpdateQuery(id, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [id, expiresAt],
    });

    return results.rows[0];
  }
}

async function expireById(id) {
  const expiredSessionObject = await runUpdateQuery(id);
  return expiredSessionObject;

  async function runUpdateQuery(id) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = expires_at - interval '1 year',
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [id],
    });

    return results.rows[0];
  }
}

const session = {
  findOneValidByToken,
  create,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
