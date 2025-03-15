const db = require("../../db/connection")
const { 
    checkExists,
    paginationSql
 } = require("../utils");
const format = require("pg-format");

exports.fetchArticles = async (queries) => {
    const allowedOrder = ["asc", "desc"];
    const { order, topic, limit, p } = queries;

    if (topic) await checkExists('topics', 'slug', topic);
    
    let queryStr = `
        SELECT 
            articles.article_id, articles.author, articles.topic, 
            articles.title, articles.created_at, articles.votes, 
            articles.article_img_url,
            CAST(COALESCE(COUNT(comments.comment_id),0) AS INT )AS  comment_count

        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id `
    
    if(topic) {
        queryStr += format(`WHERE topic = %L`,topic)
    };

    queryStr += `GROUP BY articles.article_id `
        
    if(!allowedOrder.includes(order))    
        queryStr += `ORDER BY articles.created_at DESC `;
    else {
        queryStr += format(`ORDER BY articles.created_at %s `, order);
    };

    const total_count = (await db.query(queryStr)).rows.length;

    queryStr += paginationSql(limit, p);

    const articles = ( await db.query(queryStr) ).rows;
    
    return {articles, total_count};
};

exports.fetchArticle = async (article_id) => {
    await checkExists('articles', 'article_id', article_id);
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

exports.createArticle = async (body) => {
    
    const {author, title, topic , article_img_url} = body;
    await checkExists('users','username', author);
    await checkExists('topics','slug', topic);
    
    return (await db.query(`
        WITH new_article AS (
            INSERT INTO articles
                (author,title, body, topic,article_img_url)
            VALUES
                ($1, $2,$3,$4,$5)
        RETURNING *
        )
        SELECT 
            new_article.article_id, new_article.author, new_article.topic, new_article.title, 
            new_article.body, new_article.created_at, new_article.votes, 
            new_article.article_img_url, CAST(COALESCE(COUNT(comments.comment_id),0) AS INT )AS  comment_count
        FROM new_article
        LEFT JOIN comments ON comments.article_id = new_article.article_id
        GROUP BY 
            new_article.article_id, new_article.author, new_article.topic, new_article.title, 
            new_article.body, new_article.created_at, new_article.votes, 
            new_article.article_img_url`
            , [author, title, body.body, topic , article_img_url])).rows[0];
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

exports.eliminateArticle = async (params) => {
    const { article_id } = params
    await db.query(`DELETE FROM comments WHERE article_id = $1`,[article_id])
    await checkExists("articles", "article_id", article_id);
    await db.query(`DELETE FROM articles WHERE article_id = $1`,[article_id]);
}