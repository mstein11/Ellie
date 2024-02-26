import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import crypto from 'crypto';

import legaldata from './data/rulebook-00-legal-srd';
import racesdata from './data/rulebook-01-races-srd';
import classesdata from './data/rulebook-02-classes-srd';
import beyond1stdata from './data/rulebook-03-beyond1st-srd';
import equipmentdata from './data/rulebook-04-equipments-srd';
import featsdata from './data/rulebook-05-feats-srd';
import mechanicsdata from './data/rulebook-06-mechanics-srd';
import combatdata from './data/rulebook-07-combat-srd';
import spellcastingdata from './data/rulebook-08-spellcasting-srd';
import runningdata from './data/rulebook-09-running-srd';
import magicitemsdata from './data/rulebook-10-magic-items-srd';
import monstersdata from './data/rulebook-11-monsters-srd';
import conditionsdata from './data/rulebook-12-conditions-srd';
import godsdata from './data/rulebook-13-gods-srd';
import planesdata from './data/rulebook-14-planes-srd';
import creaturesdata from './data/rulebook-15-creatures-srd';
import npcsdata from './data/rulebook-16-npcs-srd';

export function loadSourceRaw(): string[] {
    return [legaldata, racesdata, classesdata, beyond1stdata, equipmentdata, featsdata, mechanicsdata, combatdata, spellcastingdata, runningdata, magicitemsdata, monstersdata, conditionsdata, godsdata, planesdata, creaturesdata, npcsdata]
}


export async function loadSource(): Promise<{ documents: Document[], ids: string[] }> {

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: undefined,
        chunkOverlap: 0,
    });


    const data = [legaldata, racesdata, classesdata, beyond1stdata, equipmentdata, featsdata, mechanicsdata, combatdata, spellcastingdata, runningdata, magicitemsdata, monstersdata, conditionsdata, godsdata, planesdata, creaturesdata, npcsdata].join("\n");
    const output = await splitter.createDocuments([data]);
    // const output = await splitter.createDocuments([racesdata]);
    const ids = [];
    for (const doc of output) {
        const toHash = doc.pageContent + JSON.stringify(doc.metadata);
        const hash = crypto.createHash('sha256').update(toHash).digest('hex')
        ids.push(hash)
    }
    return { documents: output, ids };
}