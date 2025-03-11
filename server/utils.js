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