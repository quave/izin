import express from 'express'
import path from 'path'
import m from 'moment'
import { reverse, all, propEq, merge, addIndex, reduce, assoc, map } from 'ramda'
import render from './render'
import questions from './questions'
import { getData, close, addItem } from './db'
const app = express()

const dataFile = 'data.json'

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
    console.log(data)

    res.render('index', merge(result || {}, {
      data: reverse(data.map(render)),
      questions
    }))
  })

app.get('/', (req, res) => displayPage(res))

const valid = qs => qs && qs.length == 6 && all(propEq('length', 3), qs)

app.post('/', (req, res) => {
  console.debug(req.body)

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

  console.debug("new item", newItem)

  addItem(newItem).then(() => {
    displayPage(res, {})
  })
})

app.listen(3000)

process.on('exit', close)
