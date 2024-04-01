import {
  MarkdownTextSplitter,
  RecursiveCharacterTextSplitter
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

export function loadSourceRaw(): string[] {
  return [
    legaldata,
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
    npcsdata
  ]
}

export function getTablesFromDocs(inputString: string) {
  const pattern = /(\|.*\|\r?\n\|[-:|]*\|\r?\n)(\|.*\|\r?\n)*/g
  let positions = []
  let match = pattern.exec(inputString)
  while (match) {
    positions.push({ start: match.index, end: match.index + match[0].length })
    match = pattern.exec(inputString)
  }
  return positions
}

export function getLvl1Headings(inputString: string) {
  const pattern = /.+\n=+\n/g
  let positions = []
  let match = pattern.exec(inputString)
  while (match) {
    positions.push({ start: match.index, end: match.index + match[0].length })
    match = pattern.exec(inputString)
  }
  return positions
}

function getPositionsOfNeedle(inputString: string, needel: RegExp) {
  let positions = []
  let match = needel.exec(inputString)
  while (match) {
    positions.push({ start: match.index, end: match.index + match[0].length })
    match = needel.exec(inputString)
  }
  return positions
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

export async function prepareLvl1Headings(
  inputString: string
): Promise<DocumentSlice[]> {
  const pattern = /.+\n=+\n/g
  const res = getPositionsOfNeedle(inputString, pattern)

  return res.map((item, index) => {
    let endOfSlice = inputString.length - 1
    if (index < res.length - 1) {
      endOfSlice = res[index + 1].start - 1
    }

    return {
      data: inputString.substring(item.start, endOfSlice),
      startInParent: item.start,
      startInDoc: item.start,
      endInDoc: endOfSlice,
      endInParent: endOfSlice,
      length: endOfSlice - item.start,
      parentSlice: null
    }
  })
}

type DocumentSlice = {
  data: string
  startInParent: number
  startInDoc: number
  endInDoc: number
  endInParent: number
  length: number
  parentSlice: DocumentSlice | null
}

export function prepareLvl2Headings(
  input: DocumentSlice,
  patternConfig: { pattern: RegExp, isTable: boolean }
): DocumentSlice[] {
  const subSlicePositions = getPositionsOfNeedle(input.data, patternConfig.pattern);

  if (subSlicePositions.length === 0) {
    return [input];
  }

  if (subSlicePositions.some(subSlicePosition => subSlicePosition.start !== 0)) {
    const startOfFirstSubslice = subSlicePositions.toSorted((a, b) => a.start - b.start)[0];
    subSlicePositions.unshift({ start: 0, end: startOfFirstSubslice.start });
  }
  
  return subSlicePositions.map((subSlicePosition, index) => {
    //this does not work for tables, table can be closed and afterwards there can be text
    let endOfSubSlice = input.data.length - 1;
    if (index < subSlicePositions.length - 1) {
      //the start of the next slice is the end of the current slice
      endOfSubSlice = subSlicePositions[index + 1].start - 1
    }
    
    return {
      data: input.data.substring(subSlicePosition.start, endOfSubSlice),
      startInParent: subSlicePosition.start,
      startInDoc: input.startInDoc + subSlicePosition.start,
      endInParent: endOfSubSlice,
      endInDoc: input.startInDoc + endOfSubSlice,
      length: endOfSubSlice - subSlicePosition.start,
      parentSlice: input
    }
  })
}

export async function loadSourceV2({
  data = [racesdata, classesdata].join('\n'),
  idProvider = () => randomUUID()
} = {}): Promise<any> {

  const maxLength = 1000;
  const splitByFirstLvl = await prepareLvl1Headings(data)
  let currentLevel = [...splitByFirstLvl];
  
  let counter = 0;
  const regexes = [
    {
      pattern: /.+\n-+\n/g,
      isTable: false
    }
    ,
    {
      pattern: /^#\s.+\n/gm,
      isTable: false
    }
    ,
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
      pattern: /(\|.*\|\r?\n\|[-:|]*\|\r?\n)(\|.*\|\r?\n)*/g,
      isTable: true
    }
  ]
 
  const finalSlices = [];

  while (currentLevel.some(curlvl => curlvl.data.length > maxLength)) {
    if(counter > regexes.length -1 || currentLevel.length === 0) {
      finalSlices.push(...currentLevel);
      break;
    }

    finalSlices.push(...currentLevel.filter(curLvl => curLvl.data.length <= maxLength));

    currentLevel = currentLevel.filter(curlvl => curlvl.data.length > maxLength).map(curLvl => {
        return prepareLvl2Headings(curLvl, regexes[counter]);
      }).flat();

      console.log("after lvl " + counter + " we have " + currentLevel.length + " slices left and " + finalSlices.length + " final slices");

      counter++;
  }

  return finalSlices;

}
