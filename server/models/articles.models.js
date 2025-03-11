const db = require("../../db/connection")

exports.fetchArticles = async () => {
    return (await db.query(`
        SELECT 
            articles.article_id, articles.author, articles.topic, 
            articles.title, articles.created_at, articles.votes, 
            articles.article_img_url, CAST(COALESCE(COUNT(comments.comment_id),0) AS INT )AS  comment_count

        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;`)).rows
};

exports.fetchArticle = async (article_id) => {
    const articles = (await db.query(`SELECT * FROM articles WHERE article_id =$1`, [article_id])).rows;
    if (articles.length === 0) {
        throw { status: 404, msg: "Resource not found" };
    };
   
    return articles[0];
};