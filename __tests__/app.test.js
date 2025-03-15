const endpointsJson = require("../server/endpoints.json");
const request = require("supertest")
const app = require("../server/app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const testData = require("../db/data/test-data/index")

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("ANY /notapath", () => {
  test("404: responds with error message when path is not found", () => {
    return request(app)
      .get("/notapath")
      .expect(404)
      .then(( {body} ) => {
        expect(body.msg).toBe('Path not found')
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of topics", () => {
    return request(app).get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3)
        body.topics.forEach((topic) => {
          const { slug, description } = topic;
          expect(typeof slug).toBe('string');
          expect(typeof description).toBe('string');
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with an article when provided a valid article_id", () => {
    return request(app).get(`/api/articles/13`)
    .expect(200)
    .then((response) => {
      const { article_id, author, topic, title, body, created_at, votes, article_img_url } = response.body.article;
      expect(article_id).toBe(13);
      expect(typeof author).toBe('string');
      expect(typeof topic).toBe('string');
      expect(typeof title).toBe('string');
      expect(typeof body).toBe('string');
      expect(typeof created_at).toBe('string');
      expect(typeof votes).toBe('number');
      expect(typeof article_img_url).toBe('string');
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated content", () => {
    return request(app).get(`/api/articles/9999`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });

  });
  test("400: responds with 'Bad request' when passed an invalid article_id", () => {
    return request(app).get(`/api/articles/bananana`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });

  });
  describe("comment_count", () => {
    test("200:responds with a comment count key", () => {
      return request(app).get(`/api/articles/1`)
      .expect(200)
      .then(({body}) => {
        expect(body.article.comment_count).toBe(11);
      });
    });
  });
});

describe("GET /api/articles", () => {
  describe("articles", () => {
    test("200: responds with an array of articles", () => {
      return request(app).get(`/api/articles`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);
        expect(body.articles).toBeSortedBy('created_at',{ descending: true });
        body.articles.forEach((article) => {
          const { article_id, author, topic, title, created_at, votes, article_img_url, comment_count, body } = article;
          expect(typeof article_id).toBe('number');
          expect(typeof author).toBe('string');
          expect(typeof topic).toBe('string');
          expect(typeof title).toBe('string');
          expect(typeof created_at).toBe('string');
          expect(typeof votes).toBe('number');
          expect(typeof article_img_url).toBe('string');
          expect(typeof comment_count).toBe('number');
          expect(body).toBe(undefined);
        });
      });
    });
  });
  describe("sort_by queries", () => {
    test("200:sort by created_at ascending", () => {
      return request(app).get(`/api/articles?order=asc`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toBeSortedBy('created_at',{ descending: false });
      });
    });
    test("200:sort by created_at descending", () => {
      return request(app).get(`/api/articles?order=desc`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toBeSortedBy('created_at',{ descending: true });
      });
    });
    test("200: order ?order=gibberish return default behaviour", () => {
      return request(app).get(`/api/articles?order=gibberish"DROP TABLE users;"`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(13);
        expect(body.articles).toBeSortedBy('created_at',{ descending: true });
      });
    });
  });
  describe("filter by queries", () => {
    test("200: filter by topic", () => {
      return request(app).get(`/api/articles?topic=mitch`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article.topic).toBe('mitch');
        });
      });
    });

    test("200: filter by topic but no articles", () => {
      return request(app).get(`/api/articles?topic=paper`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(0);
      });
    });

    test("404: Resource not found topic=I am not a topic", () => {
      return request(app).get(`/api/articles?topic=i_am_not_a_topic`)
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('Resource not found');
      });
    });
  });
  describe("generic queries", () => {
    test("200 ?not_a_key = mitch return default behaviour", () => {
      return request(app).get(`/api/articles?not_a_key=mitch`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(13);
        expect(body.articles).toBeSortedBy('created_at',{ descending: true });
      });
    });
    test("200: multiple queries ?order = desc & topic = mitch", () => {
      return request(app).get(`/api/articles?order=asc&topic=mitch`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(12);
        expect(body.articles).toBeSortedBy('created_at',{ descending: false });
        body.articles.forEach((article) => {
          expect(article.topic).toBe('mitch');
        });
      });
    });
    test("200: multiple queries 1 valid 1 invalid", () => {
      return request(app).get(`/api/articles?invalid_key=asc&topic=mitch`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(12);
        expect(body.articles).toBeSortedBy('created_at',{ descending: true });
        body.articles.forEach((article) => {
          expect(article.topic).toBe('mitch');
        });
      });
    });
  });

  describe("limit query", () => {
    test("200: responds with 5 articles", () => {
    return request(app).get(`/api/articles?limit=5`)
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).toBe(5)
      });
    });
    test("200: responds with 10 if limit < 0", () => {
      return request(app).get(`/api/articles?limit=-5`)
      .expect(200)
      .then(({body}) => {
      expect(body.articles.length).toBe(10)
      });
    })
    test("200: responds with 10 articles if limit is declared but undefined", () => {
    return request(app).get(`/api/articles?limit&p=1`)
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).toBe(10)
      });
    });
    test("200: responds with 10 articles if limit is declared but invalid", () => {
      return request(app).get(`/api/articles?limit=jkl&p=1`)
      .expect(200)
      .then(({body}) => {
        expect(body.articles.length).toBe(10)
        });
      });
    });
    describe("p query", () => {
      test("200: has no effect without the limit query", () => {
        return request(app).get(`/api/articles?p=2`)
          .expect(200)
          .then(({body}) => {
            expect(body.articles.length).toBe(13);
        });
      });
      test("200: reduces the number returned from the limit when running out of articles", () => {
        return request(app).get(`/api/articles?limit=10&p=2`)
          .expect(200)
          .then(({body}) => {
            expect(body.articles.length).toBe(3);
          });
      });
      test("200: returns an empty array when the page number exceeds the number of articles", () => {
        return request(app).get(`/api/articles?limit=10&p=10`)
          .expect(200)
          .then(({body}) => {
            expect(body.articles.length).toBe(0);
          });
      });
      test("200:defaults to OFFSET 0 if p < 0", () => {
        return request(app).get(`/api/articles?limit=10&p=-1`)
        .expect(200)
        .then(({body}) => {
          expect(body.articles.length).toBe(10);
        });
      });
      test("200: defaults to page 1 if given an invalid p = jkl", () => {
          return request(app).get(`/api/articles?limit=10&p=jkl`)
          .expect(200)
          .then(({body}) => {
            expect(body.articles.length).toBe(10);
          });
      });
    });
    describe("total_count", () => {
      test("200: has a total_count property", () =>{
        return request(app).get(`/api/articles?limit=10&p=1`)
        .expect(200)
        .then(({body}) => {
          expect(body.total_count).toBe(13);
        });
      });
      test("200: that is responsive to queries", () =>{
        return request(app).get(`/api/articles?limit=10&p=1&topic=cats`)
        .expect(200)
        .then(({body}) => {
          expect(body.total_count).toBe(1);
        });
      });
    });
});

describe("GET /api/articles/:article_id/comments", () => {

  test("200: responds with an array of comments", () => {
    return request(app).get(`/api/articles/9/comments`)
    .expect(200)
    .then(({ body }) => {
      expect(body.comments.length).toBe(2)
      body.comments.forEach((comment) => {
        const { comment_id, votes, created_at, author, body, article_id } = comment;
        expect(typeof comment_id).toBe('number');
        expect(typeof votes).toBe('number');
        expect(typeof created_at).toBe('string');
        expect(typeof author).toBe('string');
        expect(typeof body).toBe('string');
        expect(article_id).toBe(9);
      });
    });
  });

  test("200: responds with an empty array when passed a valid article_id with no comments", () => {
    return request(app).get(`/api/articles/13/comments`)
    .expect(200)
    .then(({ body }) => {
      expect(body.comments).toEqual([]);
    });
  });

  test("400: responds with 'Bad request' when passed an invalid article_id", () => {
    return request(app).get(`/api/articles/bananana/comments`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated article", () => {
    return request(app).get(`/api/articles/9999/comments`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });

  });
  describe("limit query", () => {
    test("200: responds with 5 comments", () => {
    return request(app).get(`/api/articles/1/comments?limit=5`)
    .expect(200)
    .then(({body}) => {
      expect(body.comments.length).toBe(5)
      });
    });
    test("200: responds with 10 comments if limit is declared but undefined", () => {
    return request(app).get(`/api/articles/1/comments?limit`)
    .expect(200)
    .then(({body}) => {
      expect(body.comments.length).toBe(10)
      });
    });
    test("200: responds with 10 comments if limit is declared but invalid", () => {
      return request(app).get(`/api/articles/1/comments?limit=jkl&p=1`)
      .expect(200)
      .then(({body}) => {
        expect(body.comments.length).toBe(10)
        });
      });
    test("200: responds with default behaviour if limit < 0", () => {
      return request(app).get(`/api/aticles/1/comments?limit=-4`)
    })
    });
  describe("p query", () => {
    test("200: returns defaut behaviour without the limit query", () => {
      return request(app).get(`/api/articles/1/comments?p=2`)
        .expect(200)
        .then(({body}) => {
          expect(body.comments.length).toBe(11);
      });
    });
    test("200: reduces the number returned from the limit when running out of comments", () => {
      return request(app).get(`/api/articles/1/comments?limit=5&p=3`)
        .expect(200)
        .then(({body}) => {
          expect(body.comments.length).toBe(1);
        });
    });
    test("200: returns an empty array when the page number exceeds the number of comments", () => {
      return request(app).get(`/api/articles/1/comments?limit=10&p=10`)
        .expect(200)
        .then(({body}) => {
          expect(body.comments.length).toBe(0);
        });
    });
    test("200: defaults to page 1 if given an invalid p = jkl", () => {
        return request(app).get(`/api/articles/1/comments?limit=10&p=jkl`)
        .expect(200)
        .then(({body}) => {
          expect(body.comments.length).toBe(10);
        });
    });
    test("200: responds with default pg number if p < 0", () => {
      return request(app).get(`/api/articles/1/comments?limit=10&p=-1`)
      .expect(200)
      .then(({body}) => {
        expect(body.comments.length).toBe(10);
      });
    });
  });
});

describe("GET /api/users", () => {
  test("200: responds with an array of users", () => {
    return request(app).get(`/api/users`)
    .expect(200)
    .then(({body}) => {
      expect(body.users.length).toBe(4);
      body.users.forEach((user) => {
        const { username, name, avatar_url } = user;
        expect(typeof username).toBe('string');
        expect(typeof name).toBe('string');
        expect(typeof avatar_url).toBe('string');
      });
    });
  });
});

describe("GET /api/users/:username", () => {
  test("200: responds with a user when provided a valid username", () => {
    return request(app).get(`/api/users/butter_bridge`)
    .expect(200)
    .then((response) => {
      const { username, name, avatar_url } = response.body.user;
      expect(username).toBe('butter_bridge');
      expect(typeof name).toBe('string');
      expect(typeof avatar_url).toBe('string');
    });
  });

  test("404: responds with 'Not found' when passed a valid username with no associated content", () => {
    
    return request(app).get(`/api/users/9999`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });

  });
});

describe("POST /api/topics", () => {
  test("201: post a topic", () => {
    return request(app).post(`/api/topics`)
    .send({
      "slug": "dogs",
      "description": "The superior pet",
      "img_url": "www.img_url.com"
    })
    .expect(201)
    .then(({body}) => {
      const { slug, description, img_url } = body.topic
      expect(slug).toBe("dogs");
      expect(description).toBe("The superior pet");
      expect(img_url).toBe("www.img_url.com");
    });
  });
  test("201: extra keys", () => {
    return request(app).post(`/api/topics`)
    .send({
      "slug": "dogs",
      "description": "The superior pet",
      "img_url": "www.img_url.com",
      "extra_key": "I do nothing"
    })
    .expect(201)
    .then(({body}) => {
      const { slug, description, img_url, extra_key } = body.topic
      expect(slug).toBe("dogs");
      expect(description).toBe("The superior pet");
      expect(img_url).toBe("www.img_url.com");
      expect(extra_key).toBe(undefined);
    });
  });
  test("201: only requires a slug", () => {
    return request(app).post(`/api/topics`)
    .send({
      "slug": "dogs",
    })
    .expect(201)
    .then(({body}) => {
      const { slug, description, img_url } = body.topic
      expect(slug).toBe("dogs");
      expect(description).toBe(null);
      expect(img_url).toBe(null);
    });
  });
  test("400: slug not defined", () => {
    return request(app).post(`/api/topics`)
    .send({})
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("NOT NULL VIOLATION");
    });
  });
});

describe("POST /api/articles", () => {
  test("201: post an article utilising default parameters", () => {
    return request(app).post(`/api/articles`)
    .send({
      author: "butter_bridge",
      title: "New title",
      body: "I like to test out my comedy chops by writing funny tests",
      topic: 'mitch',
      article_img_url: "https://imgur.com/gallery/heckin-bamboozled-i-was-nh9BEVV#/t/funny"
    })
    .expect(201)
    .then(( response) => {
      const { article_id, author, topic, title, created_at, votes, article_img_url, comment_count, body } = response.body.article;
      expect(typeof article_id).toBe('number');
      expect(author).toBe("butter_bridge");
      expect(topic).toBe('mitch');
      expect(title).toBe("New title");
      expect(typeof created_at).toBe('string');
      expect(typeof votes).toBe('number');
      expect(article_img_url).toBe("https://imgur.com/gallery/heckin-bamboozled-i-was-nh9BEVV#/t/funny");
      expect(typeof comment_count).toBe('number');
      expect(body).toBe("I like to test out my comedy chops by writing funny tests");
    });
  });
  test("201: body and img_url need not be defined", () => {
    return request(app).post(`/api/articles`)
    .send({
      author: "butter_bridge",
      title: "New title",
      topic: 'mitch',
    })
    .expect(201)
    .then(( response) => {
      const {article_img_url, body } = response.body.article;
      expect(article_img_url).toBe(null);
      expect(body).toBe(null);
    });
  });
  test("400 title not defined", () => {
    return request(app).post(`/api/articles`)
    .send({
      author: "butter_bridge",
      body: "I like to test out my comedy chops by writing funny tests",
      topic: 'mitch',
      article_img_url: "https://imgur.com/gallery/heckin-bamboozled-i-was-nh9BEVV#/t/funny"
    })
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("NOT NULL VIOLATION")
    });
  });
  test("404: author does not exist", () => {
    return request(app).post(`/api/articles`)
    .send({
      author:"I am not an author",
      topic: 'mitch',
    })
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Resource not found');
    });
  });
  test('404: topic does not exist', () => {
    return request(app).post(`/api/articles`)
    .send({
      author: "butter bridge",
      topic:"I am not a topic"})
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Resource not found');
    });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: adds a comment to comment table, responds with the added comment, author is a known author", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      author: "lurker",
      body: "I have ceased to lurk"
    })
    .expect(201)
    .then((response) => {
      const { comment_id, votes, created_at, author, body, article_id } = response.body.comment;
        expect(typeof comment_id).toBe('number');
        expect(votes).toBe(0);
        expect(typeof created_at).toBe('string');
        expect(author).toBe("lurker");
        expect(body).toBe("I have ceased to lurk");
        expect(article_id).toBe(1);
    });
  });

  test("201: with additional unused keys", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      author: "lurker",
      body: "I have ceased to lurk",
      unnecessary_key: "I am unnecessary",
      very_unnecessary_key: "I am very unnecessary"
    })
    .expect(201)
    .then((response) => {
      const { comment_id, votes, created_at, author, body, article_id } = response.body.comment;
        expect(typeof comment_id).toBe('number');
        expect(votes).toBe(0);
        expect(typeof created_at).toBe('string');
        expect(author).toBe("lurker");
        expect(body).toBe("I have ceased to lurk");
        expect(article_id).toBe(1);
    });
  });

  test("400: responds with 'Bad request' when passed an invalid article_id, article_id = bananana", () => {
    return request(app).post(`/api/articles/bananana/comments`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  });

  test("404: responds with 'Not found' when passed an author that doesn't exist, {author: 'definitley not an author'}", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      votes: 100,
      author: "definitely not an author",
      body: "Don't add me"
    })
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found')
    });
  });

  test("404: responds with 'Not found' when passed an incomplete body, missing {author:'I'm missing}", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      body: "Don't add me"
    })
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found')
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated article article_id = 9999 / 22", () => {
    return request(app).post(`/api/articles/22/comments`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("201: articles votes incremented, article returned", () => {
    return request(app).patch(`/api/articles/1`)
    .send({ inc_votes : 1})
    .expect(201)
    .then((response) => {
      const { article_id, author, topic, title, body, created_at, votes, article_img_url } = response.body.article;
      expect(article_id).toBe(1);
      expect(typeof author).toBe('string');
      expect(typeof topic).toBe('string');
      expect(typeof title).toBe('string');
      expect(typeof body).toBe('string');
      expect(typeof created_at).toBe('string');
      expect(votes).toBe(101);
      expect(typeof article_img_url).toBe('string');
    });
  });

  test("201: articles votes decremented", () => {
    return request(app).patch(`/api/articles/1`)
    .send({ inc_votes : -100})
    .expect(201)
    .then((response) => {
      const { votes } = response.body.article;
      expect(votes).toBe(0);
    });
  });

  test("201: articles votes changed, extra keys ignored", () => {
    return request(app).patch(`/api/articles/1`)
    .send({inc_votes : 1, mo_keys: 56, even_mo_keys: 100})
    .expect(201)
    .then( ({body}) => {
      expect(body.article.votes).toBe(101)
    });
  });

  test("201: No keys / inc_votes missing, votes stays the same", () => {
    return request(app).patch(`/api/articles/1`)
    .send({})
    .expect(201)
    .then( ({body}) => {
      expect(body.article.votes).toBe(100);
    });
  });

  test("400: increment votes by ! typeof number", () => {
    return request(app).patch(`/api/articles/1`)
    .send({ inc_votes : 'hjg'})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  })

  test("400:  article_id = bananana | responds with 'Bad request' when passed an invalid article_id", () => {
    return request(app).patch(`/api/articles/bananana`)
    .send({ inc_votes : 1})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated article article_id = 9999 / 22", () => {
    return request(app).patch(`/api/articles/22`)
    .send({ inc_votes : 1})
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });
  });
  
});

describe("PATCH /api/comments/:comment_id", () => {
  test("201: comment votes incremented, comment returned", () => {
    return request(app).patch(`/api/comments/1`)
    .send({ inc_votes : 1})
    .expect(201)
    .then((response) => {
      const { comment_id, article_id, body, votes, author, created_at } = response.body.comment;
      expect(comment_id).toBe(1);
      expect(typeof article_id).toBe('number');
      expect(typeof body).toBe('string');
      expect(votes).toBe(17);
      expect(typeof author).toBe('string');
      expect(typeof created_at).toBe('string');
    });
  });

  test("201: comment votes decremented", () => {
    return request(app).patch(`/api/comments/1`)
    .send({ inc_votes : -1})
    .expect(201)
    .then((response) => {
      const { votes } = response.body.comment;
      expect(votes).toBe(15);
    });
  });

  test("201: comment votes changed, extra keys ignored", () => {
    return request(app).patch(`/api/comments/1`)
    .send({inc_votes : 1, mo_keys: 56, even_mo_keys: 100})
    .expect(201)
    .then( ({body}) => {
      expect(body.comment.votes).toBe(17)
    });
  });

  test("201: No keys / inc_votes missing, votes stays the same", () => {
    return request(app).patch(`/api/comments/1`)
    .send({})
    .expect(201)
    .then( ({body}) => {
      expect(body.comment.votes).toBe(16);
    });
  });

  test("400: increment votes by ! typeof number", () => {
    return request(app).patch(`/api/comments/1`)
    .send({ inc_votes : 'hjg'})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  })

  test("400: comment_id = bananana | responds with 'Bad request' when passed an invalid comment_id", () => {
    return request(app).patch(`/api/comments/bananana`)
    .send({ inc_votes : 1})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  });

  test("404: responds with 'Not found' when passed a valid comment_id with no associated comment comment_id = 100", () => {
    return request(app).patch(`/api/comments/100`)
    .send({ inc_votes : 1})
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });
  });
  
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: no content", () => {
    return request(app).delete(`/api/comments/2`)
    .expect(204);
  });
  test("400:  content_id = bananananaan", () => {
    return request(app).delete(`/api/comments/bananana`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request');
    });
  });
  test("404:  content_id = 9999", () => {
    return request(app).delete(`/api/comments/9999`)
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found');
    });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: no content returned", () => {
    return request(app).delete(`/api/articles/1`)
    .expect(204);
  });
  test("400: article_id = banananan", () => {
    return request(app).delete(`/api/articles/bananan`)
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Bad request")
    });
  });
  test("204: no content returned", () => {
    return request(app).delete(`/api/articles/9999`)
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe("Resource not found");
    });
  });
});