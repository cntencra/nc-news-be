const db = require("../../db/connection")

exports.fetchTopics = async () => {
    return (await db.query(`SELECT * FROM topics`)).rows;
} 

exports.createTopic = async (body) => {
    const { slug, description, img_url } = body
    const queryValues = [];
    let queryStr = `INSERT INTO topics`;
    let valuesCount = 1;
    let fields = [];
    let values = [];

    fields.push('slug');
    values.push(`$${valuesCount}`);
    queryValues.push(slug);
    valuesCount++;

    if(description) {
        fields.push('description');
        values.push(`$${valuesCount}`);
        queryValues.push(description)
        valuesCount++
    };
    if(img_url) {
        fields.push('img_url');
        values.push(`$${valuesCount}`);
        queryValues.push(img_url)
        valuesCount++
    };

    queryStr += `(${fields.join()}) VALUES (${values.join()}) RETURNING *`;

    return (await db.query(queryStr,queryValues)).rows[0];
}
