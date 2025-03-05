const db = require("../connection")
const format = require('pg-format')
const{ convertTimestampToDate, formatComments } = require('./utils')

function seed({ topicData, userData, articleData, commentData }) {

  return db.query(`DROP TABLE IF EXISTS comments`)
    .then( () => {
      return db.query(`DROP TABLE IF EXISTS articles`)
    })
    .then( () => {
      return db.query(`DROP TABLE IF EXISTS topics`)
    })
    .then( () => {
      return db.query(`DROP TABLE IF EXISTS users`)
    })
    .then(() => {
      return createUsers()
    })
    .then(() => {
      return createTopics()
    })
    .then(() => {
      return createArticles()
    })
    .then(() => {
      return createComments()
    })
    .then(() => {
      const formatedUserData = userData.map((user) => {
        return [
          user.username,
          user.name,
          user.avatar_url
        ]
      });

      const insertStr = format(`
        INSERT INTO users
        (username, name, avatar_url)
        VALUES
        %L`, formatedUserData
      )

      return db.query(insertStr);

    })
    .then(()=>{
      
      const formatedTopicData = topicData.map((topic) => {
        return [
          topic.slug,
          topic.description,
          topic.img_url
        ]
      });

      const insertStr = format(`
        INSERT INTO topics
        (slug, description, img_url)
        VALUES
        %L`, formatedTopicData
      )

      return db.query(insertStr);

    }).then(() => {

        const formatedArticleData = articleData.map((article)=>{
          const formattedArticle = convertTimestampToDate(article)
          return [
            formattedArticle.topic,
            formattedArticle.author,
            formattedArticle.title,
            formattedArticle.body,
            formattedArticle.created_at,
            formattedArticle.votes || 0,
            formattedArticle.article_img_url
          ]

       });

      const insertStr = format(`
        INSERT INTO articles
        (topic, author, title, body, created_at, votes, article_img_url)
        VALUES
        %L
        RETURNING *`, formatedArticleData
      )

      return db.query(insertStr);
    })
    .then(({ rows }) => {
      const formattedComments = formatComments(commentData,rows);

      const mappedComments = formattedComments.map((comment) => {
        commentTimestampAltered = convertTimestampToDate(comment);
        return [
          commentTimestampAltered.article_id,
          commentTimestampAltered.author,
          commentTimestampAltered.body,
          commentTimestampAltered.votes,
          commentTimestampAltered.created_at
        ]
      })

      const insertStr = format(`
        INSERT INTO comments
        (article_id, author, body,  votes, created_at)
        VALUES
        %L
        RETURNING *`, mappedComments
      )

      return db.query(insertStr);
    });
}

function createUsers() {
  return db.query(
    `CREATE TABLE users
    (
    username VARCHAR(40) PRIMARY KEY NOT NULL,
    name VARCHAR(40),
    avatar_url VARCHAR(1000)
    )`

  )
};

function createTopics() {
  return db.query(
    `CREATE TABLE topics
    (
    slug VARCHAR(40) PRIMARY KEY NOT NULL,
    description VARCHAR(40),
    img_url VARCHAR(1000)
    )`

  )
}
function createArticles() {
  return db.query(
    `CREATE TABLE articles
    (
    article_id SERIAL PRIMARY KEY NOT NULL,
    topic VARCHAR(40) REFERENCES topics(slug) NOT NULL,
    author VARCHAR(40) REFERENCES users(username) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000)
    )`
  )
}
function createComments() {
  return db.query(
    `CREATE TABLE comments
    (
    comment_id SERIAL PRIMARY KEY NOT NULL,
    article_id INT REFERENCES articles(article_id) NOT NULL,
    author VARCHAR(40) REFERENCES users(username) NOT NULL,
    body TEXT,
    votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  )
}

    
  //<< write your first query in here.

module.exports = seed;
