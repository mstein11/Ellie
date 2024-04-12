import {
  MarkdownTextSplitter,
} from 'langchain/text_splitter'
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

type DocumentSlice = {
  data: string
  startInParent: number
  startInDoc: number
  endInDoc: number
  endInParent: number
  length: number
  parentSlice: DocumentSlice | null
  children?: DocumentSlice[]
}

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
    pattern: /\n\*\*\*.+\*\*\*/g,
    isTable: false
  },
  {
    pattern: /\n\*\*.+\*\*/g,
    isTable: false
  },
  {
    pattern: /(\|.*\|\r?\n\|[-:|]*\|\r?\n)(\|.*\|\r?\n?)*/g,
    isTable: true
  }
]

function getPositionsOfNeedle(inputString: string, needel: RegExp) {
  let positions = []
  let match = needel.exec(inputString)
  while (match) {
    positions.push({ start: match.index, end: match.index + match[0].length })
    match = needel.exec(inputString)
  }
  return positions
}

function handleTable(
  input: DocumentSlice,
  patternConfig: { pattern: RegExp; isTable: boolean }
): DocumentSlice[] {
  const subSlicePositions = getPositionsOfNeedle(
    input.data,
    patternConfig.pattern
  )

  const tableSlices = subSlicePositions.map((subSlicePosition, index) => {
    return {
      data: input.data.substring(subSlicePosition.start, subSlicePosition.end),
      startInParent: subSlicePosition.start,
      startInDoc: input.startInDoc + subSlicePosition.start,
      endInParent: subSlicePosition.end,
      endInDoc: input.startInDoc + subSlicePosition.end,
      length: subSlicePosition.end - subSlicePosition.start,
      parentSlice: input
    }
  })

  const slicesAroundTables = tableSlices
    .map((tableSlice, index) => {
      //beginning until table
      const slices = []
      if (index === 0) {
        if (tableSlice.startInParent !== 0) {
          //first table but not at the beginning
          slices.push({
            data: input.data.substring(0, tableSlice.startInParent),
            startInParent: 0,
            startInDoc: input.startInDoc,
            endInParent: tableSlice.startInParent,
            endInDoc: input.startInDoc + tableSlice.startInParent,
            length: tableSlice.startInParent,
            parentSlice: input
          })
        }
      } else {
        if (tableSlices[index - 1].endInParent !== tableSlice.startInParent) {
          //text between tables
          slices.push({
            data: input.data.substring(
              tableSlices[index - 1].endInParent,
              tableSlice.startInParent
            ),
            startInParent: tableSlices[index - 1].endInParent,
            startInDoc: input.startInDoc + tableSlices[index - 1].endInParent,
            endInParent: tableSlice.startInParent,
            endInDoc: input.startInDoc + tableSlice.startInParent,
            length:
              tableSlice.startInParent - tableSlices[index - 1].endInParent,
            parentSlice: input
          })
        }
      }

      if (index === tableSlices.length - 1) {
        if (tableSlice.endInParent !== input.data.length) {
          //last table but not at the end
          slices.push({
            data: input.data.substring(
              tableSlice.endInParent,
              input.data.length
            ),
            startInParent: tableSlice.endInParent,
            startInDoc: input.startInDoc + tableSlice.endInParent,
            endInParent: input.data.length - 1,
            endInDoc: input.startInDoc + input.data.length - 1,
            length: input.data.length - 1 - tableSlice.endInParent,
            parentSlice: input
          })
        }
      }

      return slices
    })
    .flat()

  tableSlices.push(...slicesAroundTables)
  tableSlices.sort((a, b) => a.startInParent - b.startInParent)

  input.children = tableSlices
  return tableSlices
}

function prepareLvl2Headings(
  input: DocumentSlice,
  patternConfig: { pattern: RegExp; isTable: boolean }
): DocumentSlice[] {
  if (patternConfig.isTable) {
    return handleTable(input, patternConfig)
  }

  const subSlicePositions = getPositionsOfNeedle(
    input.data,
    patternConfig.pattern
  )
  if (subSlicePositions.length === 0) {
    return [input]
  }

  if (
    subSlicePositions.some(subSlicePosition => subSlicePosition.start !== 0)
  ) {
    const startOfFirstSubslice = subSlicePositions.toSorted(
      (a, b) => a.start - b.start
    )[0]
    subSlicePositions.unshift({ start: 0, end: startOfFirstSubslice.start })
  }

  return subSlicePositions.map((subSlicePosition, index) => {
    //this does not work for tables, table can be closed and afterwards there can be text
    let endOfSubSlice = input.data.length
    if (index < subSlicePositions.length - 1) {
      //the start of the next slice is the end of the current slice
      endOfSubSlice = subSlicePositions[index + 1].start - 1
    }

    const subSlice = {
      data: input.data.substring(subSlicePosition.start, endOfSubSlice),
      startInParent: subSlicePosition.start,
      startInDoc: input.startInDoc + subSlicePosition.start,
      endInParent: endOfSubSlice,
      endInDoc: input.startInDoc + endOfSubSlice,
      length: endOfSubSlice - subSlicePosition.start,
      parentSlice: input
    }
    input.children = [subSlice]
    return subSlice
  })
}

export async function loadSource({
  data = [
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
  ].join('\n'),
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

export async function loadSourceV2({
  data = [racesdata, classesdata].join('\n'),
  idProvider = () => randomUUID(),
  maxLength = 1000,
  splitterRegexes = defaultRegexes
} = {}): Promise<any> {
  const rootDocSlice: DocumentSlice = {
    data,
    startInParent: 0,
    startInDoc: 0,
    endInDoc: data.length,
    endInParent: data.length,
    length: data.length,
    parentSlice: null,
    children: []
  }

  let currentLevel = [rootDocSlice]
  let counter = 0
  const finalSlices = []

  do {
    if (counter > splitterRegexes.length - 1 || currentLevel.length === 0) {
      finalSlices.push(...currentLevel)
      break
    }

    finalSlices.push(
      ...currentLevel.filter(curLvl => curLvl.data.length <= maxLength)
    )

    currentLevel = currentLevel
      .filter(curlvl => curlvl.data.length > maxLength)
      .map(curLvl => {
        return prepareLvl2Headings(curLvl, splitterRegexes[counter])
      })
      .flat()

    counter++
  } while (currentLevel.some(curlvl => curlvl.data.length > maxLength))

  return finalSlices
}
