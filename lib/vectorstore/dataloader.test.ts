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
      maxLength: 50,
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
      maxLength: 30,
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
        maxLength: 50,
        idProvider: () => 'some-test-id-matching-schema',
        data: text
      })

      // expect(result.length).toBe(9)
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
      maxLength: 30,
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
      '| Level | Proficiency Bonus |\n|-------|-------------------|\n| 1st   | +2                |\n\n'
    )
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(90)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(4)
    expect(result[1].pageContent).toBe('SomeTextBetweenTable\n\n')
    expect(result[1].metadata.loc.characters.from).toBe(91)
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
      maxLength: 70,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(2);
    expect(result[0].pageContent).toBe("# The Heading #1\n\n## second level 1\nsome Text under second level\n\n");
    expect(result[1].pageContent).toBe("## second level 2\nSome text under second level");
  })

  it("should merge pending new lines to large tables", async () => {
    const exampleTable = 
`| Level | Proficiency Bonus | Features                                          |
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
| 11th  | +4                | Extra Attack (2)                                  |`;

    const text = `#### The Fighter\n\n${exampleTable}\n\n\n#### Subtitle\n\nsome text after table`

    const result = await hieracicalMarkdownSplitter({data: text });


    expect(result[0].pageContent).toEqual("#### The Fighter\n\n")
    expect(result[1].pageContent).toEqual(`${exampleTable}\n\n\n`)
    expect(result[2].pageContent).toEqual("#### Subtitle\n\nsome text after table");
    expect(result.length).toBe(3);
  });

  // it("should merge pending new lines to patterns", async () => { 
  //   const text = "### A heading\n\nSome text\n\n### Another heading\n\nSome other text";

  //   const res = await hieracicalMarkdownSplitter({data: text, maxLength: 20 });

  //   expect(res[0].pageContent).toEqual("### A heading\n\n");
  // });
})

describe("metadata", () => {
  it("should not have doubled ParentHeadings", async () => {
  const data = `Barbarian
=========

Class Features
--------------

As a barbarian, you gain the following class features.

#### Hit Points

**Hit Dice:** 1d12 per barbarian level

**Hit Points at 1st Level:** 12 + your Constitution modifier

**Hit Points at Higher Levels:** 1d12 (or 7) + your Constitution
modifier per barbarian level after 1st

#### Proficiencies

**Armor:** Light armor, medium armor, shields **Weapons:** Simple
weapons, martial weapons **Tools:** None

**Saving Throws:** Strength, Constitution

**Skills:** Choose two from Animal Handling, Athletics,

Intimidation, Nature, Perception, and Survival

#### Equipment

You start with the following equipment, in addition to the equipment
granted by your background:
- (*a*) a greataxe or (*b*) any martial melee weapon
- (*a*) two handaxes or (*b*) any simple weapon
- An explorer’s pack and four javelins

#### The Barbarian

| Level  | Proficiency Bonus | Features                      | Rages     | Rage Damage |
|--------|-------------------|-------------------------------|-----------|-------------|
| 1st    | +2                | Rage, Unarmored Defense       | 2         | +2          |
| 2nd    | +2                | Reckless Attack, Danger Sense | 2         | +2          |
| 3rd    | +2                | Primal Path                   | 3         | +2          |
| 4th    | +2                | Ability Score Improvement     | 3         | +2          |
| 5th    | +3                | Extra Attack, Fast Movement   | 3         | +2          |
| 6th    | +3                | Path feature                  | 4         | +2          |
| 7th    | +3                | Feral Instinct                | 4         | +2          |
| 8th    | +3                | Ability Score Improvement     | 4         | +2          |
| 9th    | +4                | Brutal Critical (1 die)       | 4         | +3          |
| 10th   | +4                | Path feature                  | 4         | +3          |
| 11th   | +4                | Relentless                    | 4         | +3          |
| 12th   | +4                | Ability Score Improvement     | 5         | +3          |
| 13th   | +5                | Brutal Critical (2 dice)      | 5         | +3          |
| 14th   | +5                | Path feature                  | 5         | +3          |
| 15th   | +5                | Persistent Rage               | 5         | +3          |
| 16th   | +5                | Ability Score Improvement     | 5         | +4          |
| 17th   | +6                | Brutal Critical (3 dice)      | 6         | +4          |
| 18th   | +6                | Indomitable Might             | 6         | +4          |
| 19th   | +6                | Ability Score Improvement     | 6         | +4          |
| 20th   | +6                | Primal Champion               | Unlimited | +4          |

### Rage

In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action.

While raging, you gain the following benefits if you aren’t wearing heavy armor:

- You have advantage on Strength checks and Strength saving throws.
- When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian, as shown in the Rage Damage column of the Barbarian table.
- You have resistance to bludgeoning, piercing, and slashing damage.

If you are able to cast spells, you can’t cast them or concentrate on them while raging.

Your rage lasts for 1 minute. It ends early if you are knocked unconscious or if your turn ends and you haven’t attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action.

Once you have raged the number of times shown for your barbarian level in the Rages column of the Barbarian table, you must finish a long rest before you can rage again.

### Unarmored Defense

While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.

### Reckless Attack

Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.

### Danger Sense

At 2nd level, you gain an uncanny sense of when things nearby aren’t as they should be, giving you an edge when you dodge away from danger.

You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can’t be blinded, deafened, or incapacitated.
  `

  const res = await hieracicalMarkdownSplitter({data, idProvider: () => 'some-id-random-random-random'});

  expect(res).toMatchSnapshot()


  });
})
