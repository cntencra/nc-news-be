# NC News

[NC news hosted by render](https://chris-nc-news.onrender.com/) 

/api details possible endpoints

GET endpoints for news site. Database contains tables
- articles \
/api/articles \
/api/articles/:article_id
- topics \
/api/topics
- users \
/api/users
- comments \
/api/comments/:comment_id \
/api/articles/:article_id/comments

## clone the repo
```bash
cd ~/path_to_dir/

git clone https://github.com/user/nc-news.git
``` 
install dependencies, 
```bash
npm install
```

seed local database
```bash
npm run setup-dbs
npm run seed-dev
```
and run tests.
```bash
npm run test
```

## Setting up the .env.* files
```JavaScript
.env.development
    `PGDATABASE = nc_news`

.env.test
    `PGDATABASE = nc_news_test`
```

## minimum versions
- Node.js v23.6.0
- Postgres v16.8