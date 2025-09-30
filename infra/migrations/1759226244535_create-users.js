exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    username: {
      type: "varchar(30)", // For reference, Github limits usernames to 39 characters
      notNull: true,
      unique: true,
    },
    email: {
      type: "varchar(254)", // Why 254 in length? https://stackoverflow.com/a/1199238
      notNull: true,
      unique: true,
    },
    password: {
      type: "varchar(60)", // Why 60 in length? https://www.npmjs.com/package/bcrypt#hash-info
      notNull: true,
    },
    created_at: {
      type: "timestamptz", // Why timestamp with timezone? https://justatheory.com/2012/04/postgres-use-timestamptz
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

exports.down = false;
