import { hieracicalMarkdownSplitter } from './dataloader'

import  racesdata  from './data/rulebook-01-races-srd';
import classesdata from './data/rulebook-02-classes-srd';

describe('should test complex usecases', () => {
  it('test splitting for large table', async () => {
    const text = `Fighter
=======

Class Features
--------------

As a fighter, you gain the following class features.

#### Hit Points

**Hit Dice:** 1d10 per fighter level

**Hit Points at 1st Level:** 10 + your Constitution modifier

**Hit Points at Higher Levels:** 1d10 (or 6) + your Constitution modifier per fighter level after 1st

#### Proficiencies

**Armor:** All armor, shields

**Weapons:** Simple weapons, martial weapons

**Tools:** None

**Saving Throws:** Strength, Constitution

**Skills:** Choose two skills from Acrobatics, Animal

Handling, Athletics, History, Insight, Intimidation, Perception, and Survival

#### Equipment

You start with the following equipment, in addition to the equipment granted by your background:
- (*a*) chain mail or (*b*) leather armor, longbow, and 20 arrows
- (*a*) a martial weapon and a shield or (*b*) two martial weapons
- (*a*) a light crossbow and 20 bolts or (*b*) two handaxes
- (*a*) a dungeoneer’s pack or (*b*) an explorer’s pack

#### The Fighter

| Level | Proficiency Bonus | Features                                          |
|-------|-------------------|---------------------------------------------------|
| 1st   | +2                | Fighting Style, Second Wind                       |
| 2nd   | +2                | Action Surge (one use)                            |
| 3rd   | +2                | Martial Archetype                                 |
| 4th   | +2                | Ability Score Improvement                         |
| 5th   | +3                | Extra Attack                                      |
| 6th   | +3                | Ability Score Improvement                         |
| 7th   | +3                | Martial Archetype Feature                         |
| 8th   | +3                | Ability Score Improvement                         |
| 9th   | +4                | Indomitable (one use)                             |
| 10th  | +4                | Martial Archetype Feature                         |
| 11th  | +4                | Extra Attack (2)                                  |
| 12th  | +4                | Ability Score Improvement                         |
| 13th  | +5                | Indomitable (two uses)                            |
| 14th  | +5                | Ability Score Improvement                         |
| 15th  | +5                | Martial Archetype Feature                         |
| 16th  | +5                | Ability Score Improvement                         |
| 19th  | +6                | Ability Score Improvement                         |
| 20th  | +6                | Extra Attack (3)                                  |`

    const result = await hieracicalMarkdownSplitter({
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.map(item => item.pageContent).join('')).toEqual(text)
    expect(result.length).toBe(2)
  })
})

describe('first level heading', () => {
  it('should split if text is too long', async () => {
    const text = `The Heading #1
===========

Some Text

The Heading #2
==============

Some other Text`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 10,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2)
    expect(result[0].pageContent).toBe(
      'The Heading #1\n===========\n\nSome Text\n\n'
    )
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(38)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(5)
    expect(result[1].pageContent).toBe(
      'The Heading #2\n==============\n\nSome other Text'
    )
    expect(result[1].metadata.loc.characters.from).toBe(39)
    expect(result[1].metadata.loc.characters.to).toBe(84)
    expect(result[1].metadata.loc.lines.from).toBe(5)
    expect(result[1].metadata.loc.lines.to).toBe(8)
  })

  it('should not split if maxLength is long enough', async () => {
    const text = `The Heading #1
===========

Some Text

The Heading #2
==============

Some other Text`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 1000,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(1)
    expect(result[0].pageContent).toBe(text)
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(84)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(8)
  })

  it('should not loose text before heading', async () => {
    const text = `SomeTextBeforeHeading 

The Heading
===========
`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 10,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2)
    expect(result[0].pageContent).toBe('SomeTextBeforeHeading \n\n')
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(23)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(2)
    expect(result[1].pageContent).toBe('The Heading\n===========\n')
    expect(result[1].metadata.loc.characters.from).toBe(24)
    expect(result[1].metadata.loc.characters.to).toBe(47)
    expect(result[1].metadata.loc.lines.from).toBe(2)
    expect(result[1].metadata.loc.lines.to).toBe(4)
  })
})

describe('multiple headings', () => {
  it('should splitt on lowest until it fits', async () => {}),
    it('should split if text is too long', async () => {
      const text = `The Heading #1
===========

Some cool Text

The Heading #2
--------------

Some cool Text

# The Heading #3
  
Some cool Text
  
## The Heading #4 
  
Some cool Text

### The Heading #5
  
Some cool Text

#### The Heading #6

Some cool Text

##### The Heading #7

Some cool Text

**The Heading #8**

Some cool Text

***The Heading #9***

Some cool Text`

      const result = await hieracicalMarkdownSplitter({
        maxLength: 10,
        idProvider: () => 'some-test-id-matching-schema',
        data: text
      })

      expect(result.length).toBe(9)
      expect(result[0].pageContent).toBe(
        'The Heading #1\n===========\n\nSome cool Text\n\n'
      )
      expect(result[1].pageContent).toBe(
        'The Heading #2\n--------------\n\nSome cool Text\n\n'
      )
    })

  it('should not split if maxLength is long enough', async () => {
    const text = `The Heading #1
===========

Some Text

The Heading #2
==============

Some other Text`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 1000,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(1)
    expect(result[0].pageContent).toBe(text)
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(84)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(8)
  })

  it('should not loose text before heading', async () => {
    const text = `SomeTextBeforeHeading 

The Heading
===========
`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 10,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2)
    expect(result[0].pageContent).toBe('SomeTextBeforeHeading \n\n')
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(23)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(2)
    expect(result[1].pageContent).toBe('The Heading\n===========\n')
    expect(result[1].metadata.loc.characters.from).toBe(24)
    expect(result[1].metadata.loc.characters.to).toBe(47)
    expect(result[1].metadata.loc.lines.from).toBe(2)
    expect(result[1].metadata.loc.lines.to).toBe(4)
  })
})

describe('table splitt logic', () => {
  it('should not loose text after table', async () => {
    const text = `| Level | Proficiency Bonus |
|-------|-------------------|
| 1st   | +2                |
SomeTextAfterTable`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 50,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2)
    expect(result[0].pageContent).toBe(
      '| Level | Proficiency Bonus |\n|-------|-------------------|\n| 1st   | +2                |\n'
    )
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(89)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(3)
    expect(result[1].pageContent).toBe('SomeTextAfterTable')
    expect(result[1].metadata.loc.characters.from).toBe(90)
    expect(result[1].metadata.loc.characters.to).toBe(107)
    expect(result[1].metadata.loc.lines.from).toBe(3)
    expect(result[1].metadata.loc.lines.to).toBe(3)
  })

  it('should not loose text before table', async () => {
    const text = `SomeTextBeforeTable
| Level | Proficiency Bonus |
|-------|-------------------|
| 1st   | +2                |`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 50,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2)
    expect(result[0].pageContent).toBe('SomeTextBeforeTable\n')
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(19)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(1)
    expect(result[1].pageContent).toBe(
      '| Level | Proficiency Bonus |\n|-------|-------------------|\n| 1st   | +2                |'
    )
    expect(result[1].metadata.loc.characters.from).toBe(20)
    expect(result[1].metadata.loc.characters.to).toBe(108)
    expect(result[1].metadata.loc.lines.from).toBe(1)
    expect(result[1].metadata.loc.lines.to).toBe(3)
  })

  it('should not loose text between tables', async () => {
    const text = `| Level | Proficiency Bonus |
|-------|-------------------|
| 1st   | +2                |

SomeTextBetweenTable

| Level | Proficiency Bonus |
|-------|-------------------|
| 2nd   | +2                |`

    const result = await hieracicalMarkdownSplitter({
      maxLength: 50,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(3)
    expect(result[0].pageContent).toBe(
      '| Level | Proficiency Bonus |\n|-------|-------------------|\n| 1st   | +2                |\n'
    )
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(89)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(3)
    expect(result[1].pageContent).toBe('\nSomeTextBetweenTable\n\n')
    expect(result[1].metadata.loc.characters.from).toBe(90)
    expect(result[1].metadata.loc.characters.to).toBe(112)
    expect(result[1].metadata.loc.lines.from).toBe(4)
    expect(result[1].metadata.loc.lines.to).toBe(6)
    expect(result[2].pageContent).toBe(
      '| Level | Proficiency Bonus |\n|-------|-------------------|\n| 2nd   | +2                |'
    )
    expect(result[2].metadata.loc.characters.from).toBe(113)
    expect(result[2].metadata.loc.characters.to).toBe(201)
    expect(result[2].metadata.loc.lines.from).toBe(6)
    expect(result[2].metadata.loc.lines.to).toBe(8)
  })
})

describe("merges", () => {
  it("should merge docs", async () => {
    const text = `# The Heading #1\n\n## second level 1\nsome Text under second level\n\n## second level 2\nSome text under second level`;

    const result = await hieracicalMarkdownSplitter({
      maxLength: 100,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2);
    expect(result[0].pageContent).toBe("# The Heading #1\n\n## second level 1\nsome Text under second level\n\n");
    expect(result[1].pageContent).toBe("## second level 2\nSome text under second level");
  })

  it("should merge docs complex case", async () => {
    
    const text = [racesdata].join("");

    const originalContent = `Races
=====

### Racial Traits

The description of each race includes racial traits that are common to members of that race. The following entries appear among the traits of most races.

#### Ability Score Increase

Every race increases one or more of a character’s ability scores.

#### Age

The age entry notes the age when a member of the race is considered an adult, as well as the race’s expected lifespan. This information can help you decide how old your character is at the start of the game. You can choose any age for your character, which could provide an explanation for some of your ability scores. For example, if you play a young or very old character, your age could explain a particularly low Strength or Constitution score, while advanced age could account for a high Intelligence or Wisdom.

#### Alignment

Most races have tendencies toward certain alignments, described in this entry. These are not binding for player characters, but considering why your dwarf is chaotic, for example, in defiance of lawful dwarf society can help you better define your character.

#### Size

Characters of most races are Medium, a size category including creatures that are roughly 4 to 8 feet tall. Members of a few races are Small (between 2 and 4 feet tall), which means that certain rules of the game affect them differently. The most important of these rules is that Small characters have trouble wielding heavy weapons, as explained in “Equipment.”

#### Speed

Your speed determines how far you can move when traveling (“Adventuring”) and fighting (“Combat”).

#### Languages

By virtue of your race, your character can speak, read, and write certain languages.

#### Subraces

Some races have subraces. Members of a subrace have the traits of the parent race in addition to the traits specified for their subrace. Relationships among subraces vary significantly from race to race and world to world.

Dwarf
-----

### Dwarf Traits

Your dwarf character has an assortment of inborn abilities, part and parcel of dwarven nature.

***Ability Score Increase.*** Your Constitution score increases by 2.

***Age.*** Dwarves mature at the same rate as humans, but they’re considered young until they reach the age of 50. On average, they live about 350 years.

***Alignment.*** Most dwarves are lawful, believing firmly in the benefits of a well-ordered society. They tend toward good as well, with a strong sense of fair play and a belief that everyone deserves to share in the benefits of a just order.

***Size.*** Dwarves stand between 4 and 5 feet tall and average about 150 pounds. Your size is Medium.

***Speed.*** Your base walking speed is 25 feet. Your speed is not reduced by wearing heavy armor.

***Darkvision.*** Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can’t discern color in darkness, only shades of gray.

***Dwarven Resilience.*** You have advantage on saving throws against poison, and you have resistance against poison damage.

***Dwarven Combat Training.*** You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.

***Tool Proficiency.*** You gain proficiency with the artisan’s tools of your choice: smith’s tools, brewer’s supplies, or mason’s tools.

***Stonecunning.*** Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.

***Languages.*** You can speak, read, and write Common and Dwarvish. Dwarvish is full of hard consonants and guttural sounds, and those characteristics spill over into whatever other language a dwarf might speak.

#### Hill Dwarf

As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.

***Ability Score Increase.*** Your Wisdom score increases by 1.

***Dwarven Toughness.*** Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.

`


    const result = await hieracicalMarkdownSplitter({ data: originalContent });
    console.log(result);

    const resText = result.map((item) => { return item.pageContent; }).join("");
    
    //expect(text).toEqual(originalContent);
    expect(resText).toEqual(originalContent);
  });
})
