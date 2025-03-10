const db = require("../../db/connection")

exports.fetchTopics = async () => {
    return (await db.query(`SELECT * FROM topics`)).rows;
} 
