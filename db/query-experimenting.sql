 \c nc_news_test

\echo "server/articles.models fetchArticles query "
 
SELECT 
    articles.article_id, articles.author, articles.topic, 
    articles.title, articles.created_at, articles.votes, 
    articles.article_img_url, COALESCE(COUNT(comments.comment_id), 0 ) AS  comment_count

FROM articles
LEFT JOIN comments ON comments.article_id = articles.article_id
GROUP BY articles.article_id
ORDER BY articles.created_at DESC;

SELECT *
FROM articles;

SELECT *
FROM comments;