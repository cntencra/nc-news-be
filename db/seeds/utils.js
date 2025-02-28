const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.formatComments = (commentData, articleRows) => {
  
  const lookUp = this.articleLookup(articleRows);
 
  return commentData.map(({article_title, ...otherProperties}) => {

    if(!article_title) return {...otherProperties}

    const newComment = {...otherProperties};
    newComment.article_id = lookUp[article_title];
    return  newComment;
  })
}

exports.articleLookup = (articleData) => {
  return articleData.reduce((accumulator, article)=> {
    accumulator[article.title] = article.article_id;
    return accumulator;
  }, {})
}



