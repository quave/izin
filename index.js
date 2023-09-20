const express = require('express');
const path = require('path');
const m = require('moment');
const { reverse, all, propEq, merge, addIndex, reduce, assoc, map } = require('ramda');
const render = require('./render');
const questions = require('./questions');
const { getData, close, addItem } = require('./db');
const app = express();

const dataFile = 'data.json';

app.set('view engine', 'slm')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.use((err, request, response, next) => {
  console.log(err)
  response.status(500).send('Something broke!')
})

const displayPage = (res, result) =>
  getData().then((data) => {
    res.render('index', {...(result || {}), 
      data: reverse(data.map(render)),
      questions
    })
  })
app.get('/', (req, res) => res.send("ok"))
app.get('/izin', (req, res) => displayPage(res))

const valid = qs => qs && qs.length == 6 && all(propEq('length', 3), qs)

app.post('/izin', (req, res) => {
  let result = {}

  if (!valid(req.body.questions)) {
    displayPage(res, { error: 'Invalid data' })
    return
  }

  const parseAns = map(parseInt)

  const newItem = addIndex(reduce)(
    (acc, item, i) => assoc('l' + (i+1), parseAns(item), acc),
    {},
    req.body.questions
  )
  newItem.date = m().format('YYYY-MM-DD HH:mm')

  addItem(newItem).then(() => {
    displayPage(res, {})
  })
})

app.listen(3000)

process.on('exit', close)
