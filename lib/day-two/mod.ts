import { detect } from "https://deno.land/std@0.208.0/fs/eol.ts"
import * as path from "https://deno.land/std@0.208.0/path/mod.ts"

const inputFile = await Deno.readTextFile(
  path.join(
    path.dirname(path.fromFileUrl(import.meta.url)),
    "input.txt",
  ),
)

const lines = inputFile.split(detect(inputFile)!)

const limits = {
  red: 12,
  green: 13,
  blue: 14,
} as const

const powers: number[] = []

for (const line of lines) {
  const gameIdMatch = /Game (\d+)/
  const gameId = line.match(gameIdMatch)?.[1]

  if (!gameId) {
    console.warn("No game ID found for line", line)
    continue
  }

  const leastRequired = {
    red: 0,
    green: 0,
    blue: 0,
  }

  for (const color of ["red", "green", "blue"] as const) {
    const colorMatch = new RegExp(`(\\d+) ${color}`, "g")
    const colorMatchResult = line.matchAll(colorMatch)

    for (const match of colorMatchResult) {
      const v = Number(match?.[1])

      if (v > leastRequired[color]) {
        leastRequired[color] = v
      }
    }
  }

  powers.push(leastRequired.red * leastRequired.green * leastRequired.blue)
}

const sum = powers.reduce((acc, curr) => acc + curr, 0)

console.log({ sum })