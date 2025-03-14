const format = require("pg-format");
const db = require("../db/connection");

exports.checkExists = async (table, column, value) => {

    const queryStr = format(`SELECT * FROM %I WHERE %I = $1`, table, column);
    const checkRows = (await db.query(queryStr, [value])).rows;

    if (checkRows.length === 0) {
        throw { status: 404, msg: "Resource not found" };
    };

    return true;
};

exports.paginationSql = ( limit, pgNumber ) => {
    let paginationStr = '';
    if (limit || limit === '') {
        let offset = 0;
        if(!isNaN(Number(pgNumber)) && !(pgNumber === '') && pgNumber >= 1) {
            offset = Math.round(pgNumber) - 1;
        };

        if (isNaN(Number(limit)) || limit === ''|| limit <= 0.51) {
            paginationStr += format(`LIMIT '10' OFFSET %L `,offset * 10);
        } else {
            paginationStr += format(`LIMIT %L OFFSET %L `, Math.round(limit), offset * Math.round(limit));
        };
    };
    return paginationStr;
};