const express = require('express');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const mongoose = require('mongoose');
const User = require('./user');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', async () => {
  if ((await User.countDocuments().exec()) > 0) return;

  Promise.all([
    User.create({ name: 'Task 1' }),
    User.create({ id: 2, name: 'Task 2' }),
    User.create({ id: 3, name: 'Task 3' }),
    User.create({ id: 4, name: 'Task 4' }),
    User.create({ id: 5, name: 'Task 5' }),
    User.create({ id: 6, name: 'Task 6' }),
    User.create({ id: 7, name: 'Task 7' }),
    User.create({ id: 8, name: 'Task 8' }),
    User.create({ id: 9, name: 'Task 9' }),
    User.create({ id: 10, name: 'Task 10' }),
  ]).then(() => {
    console.log('User added successfully');
  });
});

const PORT = process.env.PORT || 3000;

app.get('/users', paginatedAPIMiddle(User), (req, res) => {
  res.json({ Users: res.paginatedResults });
});

function paginatedAPIMiddle(User) {
  return async (req, res, next) => {
    if (Object.keys(req.query).length != 0) {
      const results = {};

      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startPoint = (page - 1) * limit;
      const endingPoint = page * limit;

      const nextPage = page + 1;
      const prePage = page - 1;

      if (startPoint > 0) {
        results.previous = {
          page: prePage,
          limit: limit,
        };
      }

      if (endingPoint < (await User.countDocuments().exec())) {
        results.next = {
          page: nextPage,
          limit: limit,
        };
      }

      // results.result = User.slice(startPoint, endingPoint)
      try {
        results.result = await User.find().limit(limit).skip(startPoint).exec();
        res.paginatedResults = results;
        next();
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
    } else {
      res.paginatedResults = await User.find().limit('-1');
      next();
    }
  };
}

app.listen(PORT, console.log('Server is running on port ' + PORT));
