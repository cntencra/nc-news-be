const db = require("../../db/connection")
const {
    checkExists, 
    paginationSql
} = require("../utils");
const format = require("pg-format");

exports.fetchComments = async (params, query) => {
    const { username } = params;
    const { limit, p } = query;
    await checkExists("users", "username", username);
    let queryStr = format(`SELECT * FROM comments WHERE comments.author= %L`, username);
    queryStr += paginationSql(limit, p);

    return (await db.query(queryStr)).rows;
    
};

exports.fetchArticleComments = async (params, query) => {
    const { article_id } = params;
    const { limit, p } = query;
    await checkExists("articles", "article_id", article_id);
    let queryStr = format(`SELECT * FROM comments WHERE comments.article_id = %L`, article_id);

    queryStr += paginationSql(limit, p);

    return (await db.query(queryStr)).rows;
    
};

exports.createArticleComment = async (article_id, body) => {
   
    const {votes, author} = body
    await checkExists("articles", "article_id", article_id);
    await checkExists("users", "username", author);
    return (await db.query(`
        INSERT INTO comments
        (author, body, article_id)
        VALUES
        ($1, $2, $3)
        RETURNING *
        `, [author, body.body, article_id])).rows[0];
};

exports.amendComment = async (params, body) => {
    const { inc_votes } = body;
    const { comment_id } = params;
    await checkExists('comments', 'comment_id', comment_id);
    
    let queryStr = `UPDATE comments `;
    const parameters = [];

    if (inc_votes) {
        queryStr += `
        SET votes = votes + $1
        WHERE comment_id = $2 `
        parameters.push(inc_votes, comment_id);
    } else {
        queryStr += `
        SET votes = votes
        WHERE comment_id = $1 `
        parameters.push(comment_id);
    };

    queryStr += `RETURNING *;`;

    return(await db.query(queryStr,parameters)).rows[0];

};

exports.eliminateComment = async (comment_id) => {
    await checkExists("comments", "comment_id", comment_id);
    await db.query(`DELETE FROM comments WHERE comment_id = $1`,[comment_id]);
    
};