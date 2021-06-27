module.exports = {
  development: {
      client: `${process.env.DB_CLIENT}`,
      connection: {
      host: `${process.env.DB_HOST}`,
      user: `${process.env.DB_USER}`, // replace with your mysql username
      password: ``, // replace with your mysql password
      database: `${process.env.DB_NAME}`
    },
    debug: true
  },
  pool: {
    min: 2,
    max: 5
  }
};