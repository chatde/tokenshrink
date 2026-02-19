/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './schema/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
