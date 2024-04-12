import { loadSource, loadSourceV2, loadSourceV2WithLangchainFormat } from './dataloader'

describe('should test dataloader', () => {
  it('should test dataloader', async () => {
    const result = await loadSource({
      idProvider: () => 'some-test-id-matching-schema'
    })
    expect(result).toMatchSnapshot()
  })

  it('test v2', async () => {
    const result = await loadSourceV2({
      idProvider: () => 'some-test-id-matching-schema'
    })
    const res = result.map((item: any) => {
      return { ...item, parentSlice: null }
    })

    const largeDocs = res
      .filter((item: any) => item.data.length > 1000)
      .sort((a: any, b: any) => a.data.length - b.data.length)
    console.log('large docs: ' + largeDocs.length)
    console.log('all docs: ' + res.length)
    // expect(largeDocs).toMatchSnapshot()

    expect(
      result
        .filter((item: any) => !item.children)
        .sort((a: any, b: any) => a.startInDoc - b.startInDoc)
        .map((item: any) => item.data)
        .join('\n---xxx---\n')
    ).toMatchSnapshot()

    expect(
      res.sort((a: any, b: any) => a.data.length - b.data.length)
    ).toMatchSnapshot()
    expect({
      length: res.length,
      lengthGreater1000: largeDocs.length
    }).toMatchSnapshot()
  })

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

    const result = await loadSourceV2({
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(
      result
        .filter((item: any) => !item.children)
        .sort((a: any, b: any) => a.startInDoc - b.startInDoc)
        .map((item: any) => item.data)
        .join('\n---xxx---\n')
    ).toMatchSnapshot()

    expect(result.length).toBe(7)
  })
})

describe('first level heading', () => {
  it('should not loose text after before heading', async () => {
    const text = `SomeTextBeforeHeading 

The Heading
===========
`

    const result = await loadSourceV2WithLangchainFormat({
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

  it('should not split if maxLength is long enough', async () => {
    const text = `The Heading #1
    ===========

    Some Text

    The Heading #2
    ==============

    Some other Text`

    const result = await loadSourceV2WithLangchainFormat({
      maxLength: 1000,
      idProvider: () => 'some-test-id-matching-schema',
      data: text
    })

    expect(result.length).toBe(1)
    expect(result[0].pageContent).toBe(text)
    expect(result[0].metadata.loc.characters.from).toBe(0)
    expect(result[0].metadata.loc.characters.to).toBe(104)
    expect(result[0].metadata.loc.lines.from).toBe(0)
    expect(result[0].metadata.loc.lines.to).toBe(8)
  })
})

describe('table splitt logic', () => {
  it('should not loose text after table', async () => {
    const text = `| Level | Proficiency Bonus |
|-------|-------------------|
| 1st   | +2                |
SomeTextAfterTable`

    const result = await loadSourceV2WithLangchainFormat({
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

    const result = await loadSourceV2WithLangchainFormat({
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

    const result = await loadSourceV2WithLangchainFormat({
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
