const {
  convertTimestampToDate,
  formatComments,
  articleLookup,
} = require("../db/seeds/utils");

const {
  checkExists,
  paginationSql
} = require("../server/utils");

const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("Article Lookup", () => {
  describe("Functionality Tests", () => {
    test("returns an empty object if passed an empty array", () =>{
      expect(articleLookup([])).toEqual({});
    });
    test("converts an array of article_id and title properties to a title and article_id look up object", () => {
      const articleData = [ { article_id: 1, title: 'Living in the shadow of a great man' } ] ;
      expect(articleLookup(articleData)).toEqual({'Living in the shadow of a great man': 1})
    })
    test("returns multiple title property lookups if passed an array with multiple objects", () => {
      const articleData = [ 
        { article_id: 1, title: 'Living in the shadow of a great man' },
        { article_id: 2, title: 'Sony Vaio; or, The Laptop' },
        { article_id: 3, title: 'Eight pug gifs that remind me of mitch' },
       ] ;
      expect(articleLookup(articleData)).toEqual(
        {'Living in the shadow of a great man': 1,
        'Sony Vaio; or, The Laptop': 2 ,
        'Eight pug gifs that remind me of mitch': 3}
      );
    });

  });
  describe("Purity Tests", () => {
    test("does not mutate the original array", () => {
      const articleData = [ { article_id: 1, title: 'Living in the shadow of a great man' } ];
      articleLookup(articleData);

      expect(articleData).toEqual([ { article_id: 1, title: 'Living in the shadow of a great man' } ]);
    });

  })
})

describe("Format Comments", () => {
  describe("Functionality Tests", () => {
    test("returns an empty array if passed an empty array", () => {

      expect(formatComments([],[])).toEqual([]);

    });
    test("converts an article_title property to an id", () => {
      const comments = [{article_title: 'A'}];
      const articleIds = [ { article_id: 6, title: 'A' } ];
      const result = formatComments(comments, articleIds)
      expect(result[0].article_id).toBe(6);
    });

    test("converts multiple article_title properties to IDs", () => {
      const comments = [{ article_title: 'A' }, {article_title: 'Z'}]

      const articleIds = [ { article_id: 6, title: 'A' }, { article_id: 7, title: 'Z' }]

      expect(formatComments(comments, articleIds)).toEqual([{article_id: 6},{article_id: 7}])

    })

  });

    describe("Purity Tests", () => {
      test("does not modify the input array", () => {
        const comments = [{article_title: 'A'}];

        const articleIds = [ { article_id: 6, title: 'A' } ];

        formatComments(comments, articleIds)

        expect(comments).toEqual([{article_title: 'A'}] );
      });
      test("input arrays have a different reference to output array", () => {
        const comments = [{article_title: 'A'}];

        const articleIds = [ { article_id: 6, title: 'A' } ];

        const result = formatComments(comments, articleIds)

        expect(comments).not.toBe(result);
        expect(articleIds).not.toBe(result);

      });
      test("the objects inside the input arrays have a different references to the output array", () => {
        const comments = [{article_title: 'A'}];

        const articleIds = [ { article_id: 6, title: 'A' } ];

        const result = formatComments(comments, articleIds)

        expect(comments[0]).not.toBe(result[0]);
        expect(articleIds[0]).not.toBe(result[0]);

      });

  })
})

describe("checkExists", () => {
  beforeEach(() => {
    return seed(data);
  });
  
  afterAll(() => {
    return db.end();
  });

  test("Returns undefined if the resource exists", () => {
    const table = 'articles';
    const column = 'article_id';
    const value = 1;

    checkExists(table, column, value)
    .then((res) => {
      expect(res).toBe(true);
    })
  });

  test("Returns 'Resource not found' if the resource doesn't exist", () => {
    const table = 'articles';
    const column = 'article_id';
    const value = 999999;

    checkExists(table, column, value)
    .then((res) => {
      expect(res.status).toBe(404);
      expect(res.msg).toBe("Resource not found");
    })
  });
});

describe("paginationSql", () => {
  describe("LIMIT", () => {
    test("returns LIMIT = limit", () => {
      const limit = 20;
      const string = paginationSql(limit)
      expect(string).toBe("LIMIT '20' OFFSET '0' ")
    });
    test("positive rational numbers", () => {
      const limit = 5.4;
      const string = paginationSql(limit);
      expect(string).toBe("LIMIT '5' OFFSET '0' ");
    });
    test("returns LIMIT 10 when passed LIMIT < 0.51", () => {
      const limit = 0.5
      const string = paginationSql(limit)
      expect(string).toBe("LIMIT '10' OFFSET '0' ")
    });
    test("returns LIMIT 10 when passed LIMIT = jkl", () => {
      const pg_number = 1;
      const limit = "jkl";
      const string = paginationSql(limit)
      expect(string).toBe("LIMIT '10' OFFSET '0' ")
    });
    test("returns '' when limit = undefined", () => {
      const string = paginationSql();
      expect(string).toBe("");
    });
  });
  describe("pg_number", () => {
    test("returns OFFSET as multiple of pg_number and limit", () => {
      const pg_number = 3;
      const limit = 5;
      const string = paginationSql(limit,pg_number);
      expect(string).toBe("LIMIT '5' OFFSET '10' ");
    });
    test("positive rational numbers", () => {
      const pg_number = 3.4;
      const limit = 5;
      const string = paginationSql(limit,pg_number);
      expect(string).toBe("LIMIT '5' OFFSET '10' ");
    });
    test("returns page number 1/ OFFSET = 0 when pg_number < 0", () => {
      const pg_number = -1;
      const limit = 5
      const string = paginationSql(limit,pg_number)
      expect(string).toBe("LIMIT '5' OFFSET '0' ")
    });
    test("returns OFFSET 0 when passed pg_number = jkl", () => {
      const pg_number = "jkl";
      const limit = 5
      const string = paginationSql(limit,pg_number)
      expect(string).toBe("LIMIT '5' OFFSET '0' ")
    });
  });
});
