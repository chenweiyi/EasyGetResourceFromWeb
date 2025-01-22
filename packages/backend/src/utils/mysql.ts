import mysql from 'mysql2/promise';
import debugLibrary from 'debug';

const debug = debugLibrary('mysql');

function createMysqlPool() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  debug('mysql pool created');
  return pool;
}

let pool: mysql.Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = createMysqlPool();
  }
  return pool;
};

const getConn = async () => {
  const pool = getPool();
  return await pool.getConnection();
};

export { createMysqlPool, getPool, getConn };
