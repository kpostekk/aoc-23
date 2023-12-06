import { detect } from "https://deno.land/std@0.208.0/fs/eol.ts"

class Scratchcard {
  constructor(
    public readonly number: number,
    public readonly winningNumbers: number[],
    public readonly yourNumbers: number[],
  ) {}

  static fromString(data: string) {
    const numbers = Array
      .from(data.matchAll(
        /(\d+)/g,
      ))
      .map((m) => ({
        index: m.index!,
        value: Number(m.at(0)),
      }))
    
    const scratchNumber = numbers[0].value
    
    const colonIndex = data.indexOf(":")
    const yourNumbersIndex = data.indexOf("|")

    const winningNumbers = numbers
      .filter((n) => n.index > colonIndex && n.index < yourNumbersIndex)
      .map((n) => n.value)
    const yourNumbers = numbers
      .filter((n) => n.index > yourNumbersIndex)
      .map((n) => n.value)
    
    return new Scratchcard(scratchNumber, winningNumbers, yourNumbers)
  }

  static *fromLines(lines: string[]) {
    for (const line of lines) {
      yield Scratchcard.fromString(line)
    }
  }

  static async fromUrl(url: string) {
    const data = await fetch(url).then((res) => res.text())

    const lines = data.split(detect(data)!)

    return Array.from(this.fromLines(lines))
  }

  get score() {
    const matches = this.yourNumbers
      .filter((n) => this.winningNumbers.includes(n))
      .length

    if (matches === 0) return 0

    return Math.pow(2, matches - 1)
  }

  get matches() {
    return this.yourNumbers
      .filter((n) => this.winningNumbers.includes(n))
      .length
  }
}

const ogCards = await Scratchcard.fromUrl(
  import.meta.url.replace("mod.ts", "scratchcards.txt"),
)

const sum = ogCards.reduce((sum, card) => sum + card.score, 0)

console.log({ sum })

// for (const card of ogCards) {
//   console.log(card.number, card.score)
// }

const countMap = new Map<number, number>()

// populate countMap
for (const card of ogCards) {
  countMap.set(card.number, 1)
}

for (const card of ogCards) {
  const numberOfInstances = countMap.get(card.number)

  if (!numberOfInstances) continue

  for (let i = card.number + 1; i <= card.number + card.matches; i++) {
    const current = countMap.get(i)

    if (!current) continue

    countMap.set(i, current + numberOfInstances)
  }
}

console.log(countMap)

const sumOfCards = Array.from(countMap.values()).reduce((sum, value) => sum + value, 0)

console.log({ sumOfCards })