import fs from 'fs'
import {append, map, compose, head, tail, toPairs} from 'ramda'
import m from 'moment'
import readline from 'readline-promise'
import render from './render'
import questions from './questions'

const ask = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  })

  const data = { date: m().format('YYYY-MM-DD HH:mm') }
  const ansToD = (n, ans) => data['l'+n] = append(ans == 3 ? 3 : 2, data['l'+n] || [])

  const askQ = (qs, n) => {
    if (!qs.length) return

    const q = head(qs)
    return rl.questionAsync(`${q["3"]}, ${q["2"]}: `).then(ans => {
      ansToD(n, ans)
      return askQ(tail(qs), n)
    })
  }

  const askCat = questPairs => {
    if (!questPairs.length) return

    const cat = head(questPairs)
    console.log(cat[0])
    return askQ(cat[1], 7 - questPairs.length).then( () => askCat(tail(questPairs)))
  }

  return askCat(toPairs(questions)).then(() => {
    rl.close()
    return data
  })
}

fs.readFile('./data.json', 'utf8', (err, json) => {
  if (err){
    console.log(err)
    return
  }

  const data = JSON.parse(json); //now it an object
  ask().then(newData => {
    data.push(newData); //add some data
    console.log(newData)
    render(newData)
    console.log('All')
    map(compose(console.log, render), data)

    fs.writeFile('data.json', JSON.stringify(data, null, 2), 'utf8', () => {}); // write it back
  })
})

export default questions
