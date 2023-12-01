import { detect } from "https://deno.land/std@0.208.0/fs/eol.ts"
import * as path from "https://deno.land/std@0.208.0/path/mod.ts"

const inputFile = await Deno.readTextFile(
  path.join(
    path.dirname(path.fromFileUrl(import.meta.url)),
    "input.txt",
  ),
)

const lines = inputFile.split(detect(inputFile)!)

const values: number[] = []

const digitsAsWords = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
} as const

type Digit = keyof typeof digitsAsWords

for (const line of lines) {
  const matcher = /(?=(one|two|three|four|five|six|seven|eight|nine|\d))/gm
  const matches = Array.from(line.matchAll(matcher))

  const firstMatch = matches.at(0)
  const lastMatch = matches.at(-1)

  if (!firstMatch || !lastMatch) {
    console.warn("No matches found for line", line)
    continue
  }

  let [, firstDigit] = firstMatch
  let [, lastDigit] = lastMatch

  firstDigit = isNaN(Number(firstDigit))
    ? digitsAsWords[firstDigit as Digit]
    : firstDigit
  lastDigit = isNaN(Number(lastDigit))
    ? digitsAsWords[lastDigit as Digit]
    : lastDigit

  const combined = Number(firstDigit + lastDigit)

  values.push(combined)
}

const sum = values.reduce((acc, curr) => acc + curr, 0)

console.log({ sum })
