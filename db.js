const { range, map, pipe, groupBy, omit, prop, toPairs, values, fromPairs } = require('ramda');
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data.sqlite3')

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

const select = sql => new Promise((resolve, reject) => {

  db.all(sql, (err, rows) => {
    if (err) {
      console.log('Error querying', err)
      reject(err)
    }

    resolve(rows)
  })
})

const getData = () => {
  const sql = `
    select s.timestamp, l.level, l.value from statements as s
    join levels as l on l.data_id = s.id
  `
  const transformLevels = pipe(
    groupBy(prop('level')),
    map(map(omit(['level']))),
    map(map(prop('value'))),
    toPairs,
    map(pair => ['l' + pair[0], pair[1]]),
    fromPairs
  )

  const transform = pipe(
    groupBy(prop('timestamp')),
    map(map(omit(['timestamp']))),
    map(transformLevels),
    toPairs,
    map(pair => ({
      date: pair[0],
      ...pair[1]
    }))
  )

  return select(sql).then((raw) => {
    return transform(raw)
  })
}

const addItem = d => {

  return runPromise("INSERT INTO statements (timestamp) VALUES (datetime(?))", [d.date])
    .then(dataId => {

      const promises = range(1, 7).flatMap(l => {

        return d['l' + l].map(v => {

          return runPromise(
            "INSERT INTO levels (data_id, level, value) VALUES (?, ?, ?)",
            [dataId, l, v])
        })
      })

      return Promise.all(promises)
    })
};

const close = () => db.close();

module.exports = { addItem, getData, close };
