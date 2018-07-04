import express from 'express'
import path from 'path'
import fs from 'fs'
import m from 'moment'
import { reverse, all, propEq, merge, addIndex, reduce, assoc, map } from 'ramda'
import render from './render'
import questions from './questions'
const app = express()

const dataFile = 'data.json'

app.set('view engine', 'slm')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})

const displayPage = (res, result) => {
  const data = JSON.parse(fs.readFileSync(dataFile))
  res.render('index', merge(result || {}, {
    data: reverse(data.map(render)),
    questions
  }))
}

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

  fs.readFile(dataFile, 'utf8', (err, json) => {
    if (err){
      console.log(err)
      return
    }

    const data = JSON.parse(json) //now it an object
    data.push(newItem) //add some data
    console.debug(JSON.stringify(data, null, 2))

    const outJson = JSON.stringify(data, null, 2)
    if (outJson.length) {
      fs.writeFile(dataFile, outJson, 'utf8', () => {})
      console.log("written ok")
    } else {
      console.log('failed to stringify')
    }
  })

  displayPage(res, {})
})

app.listen(3000)

