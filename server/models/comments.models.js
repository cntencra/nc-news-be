const db = require("../../db/connection")
const {checkExists} = require("../utils")

exports.fetchArticleComments = async (article_id) => {
    await checkExists("articles", "article_id", article_id)
    return (await db.query(`SELECT * FROM comments WHERE comments.article_id = $1`,[article_id])).rows;
    
};

exports.createArticleComment = async (article_id) => {
    const comment = (await db.query(`INSERT INTO comments`)).rows;
    return comment;
};