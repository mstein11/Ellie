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
import assert from 'assert'

type DocumentSlice = {
  data: string
  startIndexInParent: number
  startIndexInDoc: number
  endIndexInDoc: number
  endIndexInParent: number
  length: number
  parentSlice: DocumentSlice | null
  children?: DocumentSlice[]
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
    assert(match[0].length !== 0)
    positions.push({ start: match.index, end: match.index + match[0].length - 1 })
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

  if (subSlicePositions.length === 0) {
    return [input]
  }

  const tableSlices = subSlicePositions.map((subSlicePosition, index) => {
    return {
      data: input.data.substring(subSlicePosition.start, subSlicePosition.end + 1),
      startIndexInParent: subSlicePosition.start,
      startIndexInDoc: input.startIndexInDoc + subSlicePosition.start,
      endIndexInParent: subSlicePosition.end,
      endIndexInDoc: input.startIndexInDoc + subSlicePosition.end,
      length: subSlicePosition.end - subSlicePosition.start + 1,
      parentSlice: input
    }
  })

  const slicesAroundTables = tableSlices
    .map((tableSlice, index) => {
      //beginning until table
      const slices = []
      if (index === 0) {
        if (tableSlice.startIndexInParent !== 0) {
          //first table but not at the beginning
          slices.push({
            data: input.data.substring(0, tableSlice.startIndexInParent),
            startIndexInParent: 0,
            startIndexInDoc: input.startIndexInDoc,
            endIndexInParent: tableSlice.startIndexInParent - 1,
            endIndexInDoc: input.startIndexInDoc + tableSlice.startIndexInParent - 1,
            length: tableSlice.startIndexInParent,
            parentSlice: input
          })
        }
      } else {
        if (tableSlices[index - 1].endIndexInParent !== tableSlice.startIndexInParent + 1) {
          //text between tables
          slices.push({
            data: input.data.substring(
              tableSlices[index - 1].endIndexInParent + 1,
              tableSlice.startIndexInParent
            ),
            startIndexInParent: tableSlices[index - 1].endIndexInParent + 1,
            startIndexInDoc: input.startIndexInDoc + tableSlices[index - 1].endIndexInParent + 1,
            endIndexInParent: tableSlice.startIndexInParent - 1,
            endIndexInDoc: input.startIndexInDoc + tableSlice.startIndexInParent - 1,
            length:
              tableSlice.startIndexInParent - tableSlices[index - 1].endIndexInParent,
            parentSlice: input
          })
        }
      }

      if (index === tableSlices.length - 1) {
        if (tableSlice.endIndexInParent !== input.data.length - 1) {
          //last table but not at the end
          slices.push({
            data: input.data.substring(
              tableSlice.endIndexInParent + 1,
              input.data.length
            ),
            startIndexInParent: tableSlice.endIndexInParent + 1,
            startIndexInDoc: input.startIndexInDoc + tableSlice.endIndexInParent + 1,
            endIndexInParent: input.data.length - 1,
            endIndexInDoc: input.startIndexInDoc + input.data.length - 1,
            length: input.data.length - 1 - tableSlice.endIndexInParent,
            parentSlice: input
          })
        }
      }

      return slices
    })
    .flat()

  tableSlices.push(...slicesAroundTables)
  tableSlices.sort((a, b) => a.startIndexInParent - b.startIndexInParent)

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
    subSlicePositions.every(subSlicePosition => subSlicePosition.start !== 0)
  ) {
    const startOfFirstSubslice = subSlicePositions.toSorted(
      (a, b) => a.start - b.start
    )[0]
    subSlicePositions.unshift({ start: 0, end: startOfFirstSubslice.start - 1 })
  }

  return subSlicePositions.map((subSlicePosition, index) => {
    let endIndexSubSlice = input.data.length - 1
    if (index < subSlicePositions.length - 1) {
      //the start of the next slice is the end of the current slice
      endIndexSubSlice = subSlicePositions[index + 1].start - 1
    }

    const subSlice = {
      data: input.data.substring(subSlicePosition.start, endIndexSubSlice + 1),
      startIndexInParent: subSlicePosition.start,
      startIndexInDoc: input.startIndexInDoc + subSlicePosition.start,
      endIndexInParent: endIndexSubSlice,
      endIndexInDoc: input.startIndexInDoc + endIndexSubSlice,
      length: endIndexSubSlice - subSlicePosition.start + 1,
      parentSlice: input
    }
    input.children = [subSlice]
    return subSlice
  })
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

export async function loadSourceV2({
  data = defaultData.join('\n'),
  idProvider = () => randomUUID(),
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

  let currentLevel = [rootDocSlice]
  let counter = 0
  const finalSlices = []

  do {
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

    if (counter > splitterRegexes.length - 1 || currentLevel.length === 0) {
      finalSlices.push(...currentLevel)
      break
    }
  } while (currentLevel.some(curlvl => curlvl.data.length > maxLength))

  return finalSlices
}

export async function loadSourceV2WithLangchainFormat({
  data = [racesdata, classesdata].join('\n'),
  idProvider = () => randomUUID(),
  maxLength = 1000,
  splitterRegexes = defaultRegexes
} = {}): Promise<Document[]> {

  const res = await loadSourceV2({data, idProvider, maxLength, splitterRegexes})
  const relevantSlices = res.filter((item) => !item.children || item.children.length === 0); 
  const langchainDocs = relevantSlices.map((item: DocumentSlice) => {
    return {
      pageContent: item.data,
      metadata: {
        id: idProvider(),
        loc: {
          lines: {
            from: data.substring(0, item.startIndexInDoc + 1).match(/\n/g)?.length ?? 0,
            to: data.substring(0, item.endIndexInDoc + 1).match(/\n/g)?.length ?? 0
          },
          characters: {
            from: item.startIndexInDoc,
            to: item.endIndexInDoc
          }
        }
      }
    } as Document
  })

  return langchainDocs;

}