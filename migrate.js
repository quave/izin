import data from './data.json'
import { range, map } from 'ramda'
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data.sqlite3')

db.serialize(function() {
  db.run("CREATE TABLE statements (id INTEGER PRIMARY KEY ASC, timestamp)")
  db.run("CREATE TABLE levels (id INTEGER PRIMARY KEY ASC, data_id, level, value)")
})

const runPromise = (sql, args) => new Promise((resolve, reject) => {
  db.serialize(function() {
    db.run(sql, args, function(err) {
      if (err) {
        console.log('Ins error', err)
        reject(err)
        return
      }

      resolve(this.lastID)
    })
  })
})

const addItem = d => {
  console.log('Before addItem', d)

  return runPromise("INSERT INTO statements (timestamp) VALUES (datetime(?))", [d.date])
    .then(dataId => {
      console.log('Added item, id', dataId)

      const promises = range(1, 7).flatMap(l => {
        console.log('Before add level', l)

        return d['l' + l].map(v => {
          console.log('Before add l v', v)

          return runPromise(
            "INSERT INTO levels (data_id, level, value) VALUES (?, ?, ?)",
            [dataId, l, v])
        })
      })

      console.log('Got promises', promises.length)
      return Promise.all(promises)
    })
}

console.log('Start script')
const promises = data.map(addItem);

Promise.all(promises).then(() => {
  db.close()
  console.log('Closed ok')
})
console.log('End script')
