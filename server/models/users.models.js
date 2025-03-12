const db = require("../../db/connection")

exports.fetchUsers = async () => {
    return (await db.query(`SELECT * FROM users`)).rows;
}