import {map, pipe, filter, prop, addIndex, compose,
  indexOf, sum, range} from 'ramda'

const hexagramIndexes = [
  [1, 43, 14, 34, 9, 5, 26, 11],
  [10, 58, 38, 54, 61, 60, 41, 19],
  [13, 49, 30, 55, 37, 63, 22, 36],
  [25, 17, 21, 51, 42, 3, 27, 24],
  [44, 28, 50, 32, 57, 48, 18, 46],
  [6, 47, 64, 40, 59, 29, 4, 7],
  [33, 31, 56, 62, 53, 39, 52, 15],
  [12, 45, 35, 16, 20, 8, 23, 2]
]
const trigrams = [
  [true, true, true],
  [false, true, true],
  [true, false, true],
  [false, false, true],
  [true, true, false],
  [false, true, false],
  [true, false, false],
  [false, false, false],
]
const ansToLine = ans => ({
  line: sum(ans) % 2 != 0,
  strong: sum(ans) % 3 == 0,
  newLine: !!(sum(ans) % 3 == 0 ^ sum(ans) % 2 != 0)
})

const getTrigrams = data => ({
  top: indexOf(
    map(prop('line'), [
      ansToLine(data.l6),
      ansToLine(data.l5),
      ansToLine(data.l4)]),
    trigrams
  ),
  bottom: indexOf(
    map(prop('line'), [
      ansToLine(data.l3),
      ansToLine(data.l2),
      ansToLine(data.l1)]),
    trigrams
  ),
  newTop: indexOf(
    map(prop('newLine'), [
      ansToLine(data.l6),
      ansToLine(data.l5),
      ansToLine(data.l4)]),
    trigrams
  ),
  newBottom: indexOf(
    map(prop('newLine'), [
      ansToLine(data.l3),
      ansToLine(data.l2),
      ansToLine(data.l1)]),
    trigrams
  ),
})

const indexMap = addIndex(map)

const getStrong = data => pipe(
  map(i => ansToLine(data['l' + i])),
  indexMap((l, i) => ({val: l.strong, index: i+1})),
  filter(prop('val')),
  map(prop('index'))
)(range(1, 7))

const render = data => {
  const trigrams = getTrigrams(data)
  const number = hexagramIndexes[trigrams.bottom][trigrams.top]

  return {
    date: data.date,
    number,
    newNumber: hexagramIndexes[trigrams.newBottom][trigrams.newTop],
    symbol: String.fromCharCode(0x4DC0 + number - 1),
    strong: getStrong(data)
  }
}

export default render

