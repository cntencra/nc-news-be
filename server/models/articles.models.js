const db = require("../../db/connection")
const { checkExists } = require("../utils");

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
    await checkExists('articles', 'article_id', article_id);
    return (await db.query(`SELECT * FROM articles WHERE article_id =$1`, [article_id])).rows[0];
};

exports.amendArticle = async (article_id, votes) => {

    if(typeof votes.inc_votes !== 'number') throw {status:400, msg: 'Bad request'};
    await checkExists('articles', 'article_id', article_id);

    const oldVotes = (await db.query(`SELECT votes FROM articles WHERE article_id = $1`, [article_id])).rows[0];

    const queryStr = `
    UPDATE articles
    SET votes = $1
    WHERE article_id = $2
    RETURNING *`

    return(await db.query(queryStr,[oldVotes.votes + votes.inc_votes, article_id])).rows[0]

}