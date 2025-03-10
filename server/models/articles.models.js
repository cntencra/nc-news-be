const db = require("../../db/connection")

exports.fetchArticles = async (article_id) => {
    const articles = (await db.query(`SELECT * FROM articles WHERE article_id =$1`, [article_id])).rows;
    if (articles.length === 0) {
        throw { status: 404, msg: "Resource not found" };
    };
    return articles[0];
}