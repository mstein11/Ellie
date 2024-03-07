import legaldata from './rulebook-00-legal-srd';
import racesdata from './rulebook-01-races-srd';
import classesdata from './rulebook-02-classes-srd';
import beyond1stdata from './rulebook-03-beyond1st-srd';
import equipmentdata from './rulebook-04-equipments-srd';
import featsdata from './rulebook-05-feats-srd';
import mechanicsdata from './rulebook-06-mechanics-srd';
import combatdata from './rulebook-07-combat-srd';
import spellcastingdata from './rulebook-08-spellcasting-srd';
import runningdata from './rulebook-09-running-srd';
import magicitemsdata from './rulebook-10-magic-items-srd';
import monstersdata from './rulebook-11-monsters-srd';
import conditionsdata from './rulebook-12-conditions-srd';
import godsdata from './rulebook-13-gods-srd';
import planesdata from './rulebook-14-planes-srd';
import creaturesdata from './rulebook-15-creatures-srd';
import npcsdata from './rulebook-16-npcs-srd';

const getData = (all = false) => {
    if (all) {
        return racesdata + classesdata + beyond1stdata + equipmentdata + featsdata + mechanicsdata + combatdata + spellcastingdata + runningdata + magicitemsdata + monstersdata + conditionsdata + godsdata + planesdata + creaturesdata + npcsdata + legaldata;
    }
    return racesdata;
}
export default getData;