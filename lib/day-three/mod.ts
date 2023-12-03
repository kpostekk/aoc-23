import { detect } from "https://deno.land/std@0.208.0/fs/eol.ts"

type EngineArraySchema = string[][]

/**
 * Numbering starts at 0 from left top corner.
 */
type EngineCoords = {
  x: number
  y: number
}

class EngineMap {
  constructor(private readonly map: EngineArraySchema) {}

  static async fromUrl(url: string) {
    const mapString = await fetch(url).then((res) => res.text())

    const map = mapString.split(
      detect(mapString)!,
    ).map(
      (line) => Array.from(line),
    )

    return new EngineMap(map)
  }

  /**
   * Returns undefined if out of bounds.
   *
   * Returns null if empty.
   *
   * Returns string if occupied.
   */
  private read(coords: EngineCoords): string | null | undefined {
    if (coords.x < 0 || coords.y < 0) return undefined

    const value = this.map[coords.y]?.[coords.x]

    if (value === undefined) return undefined

    if (value === ".") return null

    return value
  }

  private *findNumbers(): IterableIterator<[number, EngineCoords]> {
    for (const [rowIndex, row] of this.map.entries()) {
      const content = row.join("")

      for (const match of content.matchAll(/\d+/g)) {
        yield [Number(match.at(0)), {
          x: match.index!,
          y: rowIndex,
        }]
      }
    }
  }

  private *findFrame(
    n: number,
    coords: EngineCoords,
  ): IterableIterator<EngineCoords> {
    const numberSize = Math.floor(Math.log10(n)) + 1 // String(x).length is too obvious

    const xStart = coords.x - 1,
      xEnd = coords.x + numberSize + 1,
      yStart = coords.y - 1,
      yEnd = coords.y + 2

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        yield { x, y }
      }
    }
  }

  *findFrames(): IterableIterator<[number, EngineCoords[], EngineCoords]> {
    for (const [number, coords] of this.findNumbers()) {
      yield [number, Array.from(this.findFrame(number, coords)), coords]
    }
  }

  *searchRatios(): IterableIterator<{
    ratio: number
    v1: number
    v2: number
  }> {
    const availableRatios = new Array<[number, EngineCoords]>()

    frameLoop: for (const [n, frame] of this.findFrames()) {
      const surroundings = this.searchSurroundings(frame)

      if (surroundings?.value !== "*") continue

      const matchingRatio = availableRatios.find(([, coords]) =>
        coords.x === surroundings.coords.x &&
        coords.y === surroundings.coords.y
      )

      if (matchingRatio) {
        yield {
          ratio: matchingRatio[0] * n,
          v1: matchingRatio[0],
          v2: n,
        }
        continue frameLoop
      }

      availableRatios.push([n, surroundings.coords])
    }
  }

  searchSurroundings(coords: EngineCoords[]) {
    return coords
      .map((coords) => ({
        coords,
        value: this.read(coords),
      }))
      .filter(({ value }) => !!value)
      .filter(({ value }) => !value?.match(/\d/))
      .at(0)
  }
}

// Initialize
const mapUrl = import.meta.url.replace("mod.ts", "engine.txt")

const engine = await EngineMap.fromUrl(mapUrl)

const frames = Array.from(engine.findFrames())

// Part 1
const surroundings = frames.map((
  [n, f, i],
) => [n, engine.searchSurroundings(f), i] as const)

const sum = surroundings
  .filter(([, value]) => value?.value !== undefined).map(([n]) => Number(n))
  .reduce((pv, cv) => pv + cv, 0)

console.log({ sum, surroundings })

Deno.bench("Part 1", () => {
  Array.from(engine.findFrames())
    .map(([n, f]) => [n, engine.searchSurroundings(f)] as const)
    .filter(([, value]) => value?.value !== undefined).map(([n]) => Number(n))
    .reduce((pv, cv) => pv + cv, 0)
})

// Part 2
const ratios = Array.from(engine.searchRatios())

const ratioSum = ratios.reduce((pv, cv) => pv + cv.ratio, 0)

console.log({ ratioSum, ratios })

Deno.bench("Part 2", () => {
  Array.from(engine.searchRatios()).reduce((pv, cv) => pv + cv.ratio, 0)
})
