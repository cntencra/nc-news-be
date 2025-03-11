const db = require("../../db/connection")
const {checkExists} = require("../utils")

exports.fetchArticleComments = async (article_id) => {
    await checkExists("articles", "article_id", article_id)
    return (await db.query(`SELECT * FROM comments WHERE comments.article_id = $1`,[article_id])).rows;
    
};

exports.createArticleComment = async (article_id, body) => {
   
    const {votes, author} = body
    await checkExists("articles", "article_id", article_id);
    await checkExists("users", "username", author);
    return (await db.query(`
        INSERT INTO comments
        (votes, author, body, article_id)
        VALUES
        ($1, $2, $3,$4)
        RETURNING *
        `, [votes, author, body.body, article_id])).rows[0];
};

exports.eliminateComment = async (comment_id) => {
    await checkExists("comments", "comment_id", comment_id);
    await db.query(`DELETE FROM comments WHERE comment_id = $1`,[comment_id]);
    
};