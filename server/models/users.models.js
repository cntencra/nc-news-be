const db = require("../../db/connection");
const { checkExists } = require("../utils");

exports.fetchUsers = async () => {
    return (await db.query(`SELECT * FROM users`)).rows;
}

exports.fetchUser = async (username) => {
    await checkExists('users', 'username', username);
    return (await db.query(`SELECT * FROM users WHERE users.username = $1`,[username])).rows[0];
};