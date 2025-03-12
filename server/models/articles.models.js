const db = require("../../db/connection")
const { checkExists } = require("../utils");
const format = require("pg-format");

exports.fetchArticles = async (queries) => {
    const allowedOrder = ["asc", "desc"];
    const { order, topic } = queries;

    if (topic) await checkExists('topics', 'slug', topic);
    
    let queryStr = `
        SELECT 
            articles.article_id, articles.author, articles.topic, 
            articles.title, articles.created_at, articles.votes, 
            articles.article_img_url, CAST(COALESCE(COUNT(comments.comment_id),0) AS INT )AS  comment_count

        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id `
    
    if(topic) {
        queryStr += format(`WHERE topic =%L`,topic)
    }

    queryStr += `GROUP BY articles.article_id `
        
    if(!allowedOrder.includes(order))    
        queryStr += `ORDER BY articles.created_at DESC;`;
    else {
        queryStr += format(`ORDER BY articles.created_at %s`, order);
    }
    return (await db.query(queryStr)).rows
};

exports.fetchArticle = async (article_id) => {
    await checkExists('articles', 'article_id', article_id);
    const comment_count = (await db.query)
    return (await db.query(`
        SELECT 
            articles.article_id, articles.author, articles.topic, articles.title, 
            articles.body, articles.created_at, articles.votes, 
            articles.article_img_url, CAST(COALESCE(COUNT(comments.comment_id),0) AS INT )AS  comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`, [article_id])).rows[0];
};

exports.amendArticle = async (article_id, body) => {
    await checkExists('articles', 'article_id', article_id);
    const { inc_votes } = body;

    let queryStr = `UPDATE articles `;
    const params = [];

    if (inc_votes) {
        queryStr += `
        SET votes = votes + $1
        WHERE article_id = $2 `
        params.push(inc_votes, article_id)
    } else {
        queryStr += `
        SET votes = votes
        WHERE article_id = $1 `
        params.push(article_id)
    }

    queryStr += `RETURNING *;`

    return(await db.query(queryStr,params)).rows[0]

}