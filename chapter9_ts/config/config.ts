export default {
  "development": {
    "username": "root",
    "password": "비밀번호",
    "database": "nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "비밀번호",
    "database": "nodebird_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": "비밀번호",
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
} as const
