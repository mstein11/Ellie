import { MarkdownTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

import { randomUUID } from 'crypto'

import legaldata from './data/rulebook-00-legal-srd'
import racesdata from './data/rulebook-01-races-srd'
import classesdata from './data/rulebook-02-classes-srd'
import beyond1stdata from './data/rulebook-03-beyond1st-srd'
import equipmentdata from './data/rulebook-04-equipments-srd'
import featsdata from './data/rulebook-05-feats-srd'
import mechanicsdata from './data/rulebook-06-mechanics-srd'
import combatdata from './data/rulebook-07-combat-srd'
import spellcastingdata from './data/rulebook-08-spellcasting-srd'
import runningdata from './data/rulebook-09-running-srd'
import magicitemsdata from './data/rulebook-10-magic-items-srd'
import monstersdata from './data/rulebook-11-monsters-srd'
import conditionsdata from './data/rulebook-12-conditions-srd'
import godsdata from './data/rulebook-13-gods-srd'
import planesdata from './data/rulebook-14-planes-srd'
import creaturesdata from './data/rulebook-15-creatures-srd'
import npcsdata from './data/rulebook-16-npcs-srd'
import assert from 'assert'

type PatternConfig = {
  pattern: RegExp
  isTable?: boolean
  ignorePattern?: boolean
}

type DocumentSlice = {
  data: string
  startIndexInParent: number
  startIndexInDoc: number
  endIndexInDoc: number
  endIndexInParent: number
  length: number
  parentSlice: DocumentSlice | null
  children?: DocumentSlice[]
  isTable?: boolean | undefined
  isPattern?: boolean | undefined
  level?: number | undefined
  parentHeadings?: string[]
}

const defaultData = [
  racesdata,
  classesdata,
  beyond1stdata,
  equipmentdata,
  featsdata,
  mechanicsdata,
  combatdata,
  spellcastingdata,
  runningdata,
  magicitemsdata,
  monstersdata,
  conditionsdata,
  godsdata,
  planesdata,
  creaturesdata,
  npcsdata,
  legaldata
]

const defaultRegexes = [
  {
    pattern: /.+\n=+\n/g,
    isTable: false
  },
  {
    pattern: /.+\n-+\n/g,
    isTable: false
  },
  {
    pattern: /^#\s.+\n/gm,
    isTable: false
  },
  {
    pattern: /^##\s.+\n/gm,
    isTable: false
  },
  {
    pattern: /^###\s.+\n/gm,
    isTable: false
  },
  {
    pattern: /^####\s.+\n/gm,
    isTable: false
  },
  {
    pattern: /^#####\s.+\n/gm,
    isTable: false
  },
  {
    pattern: /\n\*\*\*.+\*\*\*\n/g,
    isTable: false
  },
  {
    pattern: /\n\*\*.+\*\*\n/g,
    isTable: false
  },
  {
    pattern: /(\|.*\|\r?\n\|[-:|]*\|\r?\n)(\|.*\|\r?\n?)*(\n)*/g,
    isTable: true
  },
  {
    pattern: /\r?\n\r?\n/g,
    isTable: false,
    ignorePattern: true
  },
  {
    pattern: /\r?\n/g,
    isTable: false,
    ignorePattern: true
  }
]

function getPositionsOfNeedle(inputString: string, needel: RegExp) {
  let positions = []
  let match = needel.exec(inputString)

  while (match) {
    assert(match[0].length !== 0)
    positions.push({
      start: match.index,
      end: match.index + match[0].length - 1
    })
    match = needel.exec(inputString)
  }
  return positions
}

function handlePattern(
  input: DocumentSlice,
  patternConfig: PatternConfig
): DocumentSlice[] {
  const subSlicePositions = getPositionsOfNeedle(
    input.data,
    patternConfig.pattern
  )

  if (subSlicePositions.length === 0) {
    return [input]
  }

  const patternSlices = subSlicePositions.map(subSlicePosition => {
    return {
      data: input.data.substring(
        subSlicePosition.start,
        subSlicePosition.end + 1
      ),
      startIndexInParent: subSlicePosition.start,
      startIndexInDoc: input.startIndexInDoc + subSlicePosition.start,
      endIndexInParent: subSlicePosition.end,
      endIndexInDoc: input.startIndexInDoc + subSlicePosition.end,
      length: subSlicePosition.end - subSlicePosition.start + 1,
      parentSlice: input,
      isTable: patternConfig.isTable,
      isPattern: !patternConfig.ignorePattern,
      parentHeadings: [...(input.parentHeadings ?? [])]
    } as DocumentSlice
  })

  const slicesAroundPatterns = patternSlices
    .map((patternSlice, index) => {
      //beginning until Pattern
      const slices = [] as DocumentSlice[]
      if (index === 0) {
        if (patternSlice.startIndexInParent !== 0) {
          //first table but not at the beginning
          slices.push({
            data: input.data.substring(0, patternSlice.startIndexInParent),
            startIndexInParent: 0,
            startIndexInDoc: input.startIndexInDoc,
            endIndexInParent: patternSlice.startIndexInParent - 1,
            endIndexInDoc:
              input.startIndexInDoc + patternSlice.startIndexInParent - 1,
            length: patternSlice.startIndexInParent,
            parentSlice: input,
            parentHeadings: [...(input.parentHeadings ?? [])]
          })
        }
      } else {
        if (
          patternSlices[index - 1].endIndexInParent !==
          patternSlice.startIndexInParent + 1
        ) {
          //text between Patterns
          slices.push({
            data: input.data.substring(
              patternSlices[index - 1].endIndexInParent + 1,
              patternSlice.startIndexInParent
            ),
            startIndexInParent: patternSlices[index - 1].endIndexInParent + 1,
            startIndexInDoc:
              input.startIndexInDoc +
              patternSlices[index - 1].endIndexInParent +
              1,
            endIndexInParent: patternSlice.startIndexInParent - 1,
            endIndexInDoc:
              input.startIndexInDoc + patternSlice.startIndexInParent - 1,
            length:
              patternSlice.startIndexInParent -
              patternSlices[index - 1].endIndexInParent,
            parentSlice: input,
            parentHeadings: [
              ...(input.parentHeadings ?? []),
              ...(!patternSlice.isTable ? [patternSlices[index - 1].data] : [])
            ]
          })
        }
      }

      if (index === patternSlices.length - 1) {
        if (patternSlice.endIndexInParent !== input.data.length - 1) {
          //last Pattern but not at the end
          slices.push({
            data: input.data.substring(
              patternSlice.endIndexInParent + 1,
              input.data.length
            ),
            startIndexInParent: patternSlice.endIndexInParent + 1,
            startIndexInDoc:
              input.startIndexInDoc + patternSlice.endIndexInParent + 1,
            endIndexInParent: input.data.length - 1,
            endIndexInDoc: input.startIndexInDoc + input.data.length - 1,
            length: input.data.length - 1 - patternSlice.endIndexInParent,
            parentSlice: input,
            parentHeadings: [
              ...(input.parentHeadings ?? []),
              ...(!patternSlice.isTable ? [patternSlice.data] : [])
            ]
          })
        }
      }

      return slices
    })
    .flat()

  patternSlices.push(...slicesAroundPatterns)
  patternSlices.sort((a, b) => a.startIndexInParent - b.startIndexInParent)
  const leveledPatternSlices = patternSlices.map(slice => {
    return {
      ...slice,
      level: defaultRegexes.findIndex(
        item => item.pattern === patternConfig.pattern
      )
    }
  })

  input.children = leveledPatternSlices
  return leveledPatternSlices
}

function splitSliceByPattern(
  input: DocumentSlice,
  patternConfig: { pattern: RegExp; isTable: boolean | undefined }
): DocumentSlice[] {
  if (input.isPattern) {
    return [input]
  }

  return handlePattern(input, patternConfig)
}

function mergeSlices(slices: DocumentSlice[]): DocumentSlice {
  const mergedData = slices.map(slice => slice.data).join('')
  const firstSlice = slices[0]
  const lastSlice = slices[slices.length - 1]
  return {
    data: mergedData,
    startIndexInParent: firstSlice.startIndexInParent,
    startIndexInDoc: firstSlice.startIndexInDoc,
    endIndexInDoc: lastSlice.endIndexInDoc,
    endIndexInParent: lastSlice.endIndexInParent,
    length: mergedData.length,
    parentSlice: firstSlice.parentSlice,
    parentHeadings: [...firstSlice.parentHeadings?.filter(heading => slices.map(item => item.parentHeadings?.includes(heading)).every(Boolean)) ?? []]
  }
}

function lengthOfDocSlices(slices: DocumentSlice[]): number {
  let sum = 0

  for (const slice of slices) {
    sum += slice.length
  }

  return sum
}

function mergeCandidateSlices(
  slices: DocumentSlice[],
  maxLength: number
): DocumentSlice[] {
  const slicesCopy = [...slices]
  if (!slicesCopy.length) {
    return []
  }

  const foundMergePossibilites = [] as DocumentSlice[]

  while (slicesCopy.length) {
    const mergeCandidateSlices = [] as DocumentSlice[]
    const firstSlice = slicesCopy.shift()
    if (firstSlice) {
      mergeCandidateSlices.push(firstSlice)
    }

    do {
      const nextSlice = slicesCopy.shift()
      if (!nextSlice) {
        break
      }

      if (lengthOfDocSlices(mergeCandidateSlices) + nextSlice.length <=
          maxLength &&
        mergeCandidateSlices[0].level !== undefined &&
        nextSlice.level !== undefined &&
        nextSlice.level >= mergeCandidateSlices[0].level
      ) {
        mergeCandidateSlices.push(nextSlice)
      } else {
        slicesCopy.unshift(nextSlice)
        break
      }
    }
    while (lengthOfDocSlices(mergeCandidateSlices) < maxLength)

    if (mergeCandidateSlices.length > 1) {
      const last = mergeCandidateSlices.pop()

      if (last?.isPattern) {
        slicesCopy.unshift(last)
      } else {
        if (last) {
          mergeCandidateSlices.push(last as DocumentSlice)
        }
      }
    }

    foundMergePossibilites.push(mergeSlices(mergeCandidateSlices))
  }

  return foundMergePossibilites
}

export async function loadSource({
  data = defaultData.join('\n'),
  idProvider = () => randomUUID()
} = {}): Promise<{ documents: Document[]; ids: string[] }> {
  const splitter = MarkdownTextSplitter.fromLanguage('markdown', {
    chunkOverlap: 0
  })

  const output = await splitter.createDocuments([data])

  const ids = []
  for (const doc of output) {
    const id = idProvider()
    doc.metadata.id = id
    ids.push(id)
  }
  return { documents: output, ids }
}

export async function splitDocs({
  data = defaultData.join('\n'),
  maxLength = 1000,
  splitterRegexes = defaultRegexes
} = {}): Promise<DocumentSlice[]> {
  const rootDocSlice: DocumentSlice = {
    data,
    startIndexInParent: 0,
    startIndexInDoc: 0,
    endIndexInDoc: data.length - 1,
    endIndexInParent: data.length - 1,
    length: data.length,
    parentSlice: null,
    children: []
  }
  if (rootDocSlice.data.length <= maxLength) {
    //no splitting necessary
    return [rootDocSlice]
  }

  let currentLevel = [rootDocSlice]
  let counter = 0
  const finalSlices = []

  do {
    if (!currentLevel.some(curlvl => curlvl.data.length > maxLength)) {
      finalSlices.push(...currentLevel)
      break
    }

    currentLevel = currentLevel
      .filter(curlvl => curlvl.data.length > maxLength)
      .map(curLvl => {
        return splitSliceByPattern(curLvl, splitterRegexes[counter])
      })
      .flat()

    counter++

    if (counter > splitterRegexes.length - 1 || currentLevel.length === 0) {
      finalSlices.push(...currentLevel)
      break
    }

    finalSlices.push(
      ...currentLevel.filter(curLvl => curLvl.data.length <= maxLength)
    )
  } while (currentLevel.some(curlvl => curlvl.data.length > maxLength))

  return finalSlices
}

export async function hieracicalMarkdownSplitter({
  data = defaultData.join('\n'),
  idProvider = () => randomUUID(),
  maxLength = 1000,
  splitterRegexes = defaultRegexes
} = {}): Promise<Document[]> {
  const res = await splitDocs({ data, maxLength, splitterRegexes })
  const relevantSlices = res
    .filter(item => !item.children || item.children.length === 0)
    .sort((a, b) => a.startIndexInDoc - b.startIndexInDoc)

  const mergedSlices = mergeCandidateSlices(relevantSlices, maxLength)
  const langchainDocs = mergedSlices.map(item => {
    return {
      pageContent: item.data,
      metadata: {
        id: idProvider(),
        parentHeadings: item.parentHeadings,
        loc: {
          lines: {
            from:
              data.substring(0, item.startIndexInDoc + 1).match(/\n/g)
                ?.length ?? 0,
            to:
              data.substring(0, item.endIndexInDoc + 1).match(/\n/g)?.length ??
              0
          },
          characters: {
            from: item.startIndexInDoc,
            to: item.endIndexInDoc
          }
        }
      }
    }
  })

  langchainDocs.sort(
    (a, b) => a.metadata.loc.characters.from - b.metadata.loc.characters.from
  )

  return langchainDocs
}
