import { loadSource } from "./dataloader";
import racesdata from './data/rulebook-01-races-srd';

describe("should test dataloader", () => {
    it("should test dataloader", async () => {
        const result = await loadSource({idProvider: () => "some-test-id-matching-schema"});
        expect(result).toMatchSnapshot();
    });

    it("should load spell lists", async () => {
    const data = `### The Schools of Magic

    Academies of magic group spells into eight categories called schools of magic. Scholars, particularly wizards, apply these categories to all spells, believing that all magic functions in essentially the same way, whether it derives from rigorous study or is bestowed by a deity.
    
    The schools of magic help describe spells; they have no rules of their own, although some rules refer to the schools.
    
    **Abjuration** spells are protective in nature, though some of them have aggressive uses. They create magical barriers, negate harmful effects, harm trespassers, or banish creatures to other planes of existence.
    
    **Conjuration** spells involve the transportation of objects and creatures from one location to another. Some spells summon creatures or objects to the caster’s side, whereas others allow the caster to teleport to another location. Some conjurations create objects or effects out of nothing.
    
    **Divination** spells reveal information, whether in the form of secrets long forgotten, glimpses of the future, the locations of hidden things, the truth behind illusions, or visions of distant people or places.
    
    **Enchantment** spells affect the minds of others, influencing or controlling their behavior. Such spells can make enemies see the caster as a friend, force creatures to take a course of action, or even control another creature like a puppet.
    
    **Evocation** spells manipulate magical energy to produce a desired effect. Some call up blasts of fire or lightning. Others channel positive energy to heal wounds.
    
    **Illusion** spells deceive the senses or minds of others. They cause people to see things that are not there, to miss things that are there, to hear phantom noises, or to remember things that never happened. Some illusions create phantom images that any creature can see, but the most insidious illusions plant an image directly in the mind of a creature.
    
    **Necromancy** spells manipulate the energies of life and death. Such spells can grant an extra reserve of life force, drain the life energy from another creature, create the undead, or even bring the dead back to life.
    
    Creating the undead through the use of necromancy spells such as *animate dead* is not a good act, and only evil casters use such spells frequently.
    
    **Transmutation** spells change the properties of a creature, object, or environment. They might turn an enemy into a harmless creature, bolster the strength of an ally, make an object move at the caster’s command, or enhance a creature’s innate healing abilities to rapidly recover from injury.
    
    Spell Lists
    -----------
    
    ### Bard Spells
    
    #### Cantrips (0 Level)
    - Dancing Lights
    - Light
    - Mage Hand
    - Mending
    - Message
    - Minor Illusion
    - Prestidigitation
    - True Strike
    
    #### 1st Level
    - Bane
    - Charm Person
    - Comprehend Languages
    - Cure Wounds
    - Detect Magic
    - Disguise Self
    - Faerie Fire
    - Feather Fall
    - Healing Word
    - Heroism
    - Hideous Laughter
    - Identify
    - Illusory Script
    - Longstrider
    - Silent Image
    - Sleep
    - Speak with Animals
    - Thunderwave
    - Unseen Servant
    
    #### 2nd Level
    - Animal Messenger
    - Blindness/Deafness
    - Calm Emotions
    - Detect Thoughts
    - Enhance Ability
    - Enthrall
    - Heat Metal
    - Hold Person
    - Invisibility
    - Knock
    - Lesser Restoration
    - Locate Animals or Plants
    - Locate Object
    - Magic Mouth
    - See Invisibility
    - Shatter
    - Silence
    - Suggestion
    - Zone of Truth
    
    #### 3rd Level
    - Bestow Curse
    - Clairvoyance
    - Dispel Magic
    - Fear
    - Glyph of Warding
    - Hypnotic Pattern
    - Major Image
    - Nondetection
    - Plant Growth
    - Sending
    - Speak with Dead
    - Speak with Plants
    - Stinking Cloud
    - Tiny Hut
    - Tongues
    
    #### 4th Level
    - Confusion
    - Dimension Door
    - Freedom of Movement
    - Greater Invisibility
    - Hallucinatory Terrain
    - Locate Creature
    - Polymorph
    
    #### 5th Level
    - Animate Objects
    - Awaken
    - Dominate Person
    - Dream
    - Geas
    - Greater Restoration
    - Hold Monster
    - Legend Lore
    - Mass Cure Wounds
    - Mislead
    - Modify Memory
    - Planar Binding
    - Raise Dead
    - Scrying
    - Seeming
    - Teleportation Circle
    
    #### 6th Level
    - Eyebite
    - Find the Path
    - Guards and Wards
    - Irresistible Dance
    - Mass Suggestion
    - Programmed Illusion
    - True Seeing
    
    #### 7th Level
    - Arcane Sword
    - Etherealness
    - Forcecage
    - Magnificent Mansion
    - Mirage Arcane
    - Project Image
    - Regenerate
    - Resurrection
    - Symbol
    - Teleport
    
    #### 8th Level
    - Dominate Monster
    - Feeblemind
    - Glibness
    - Mind Blank
    - Power Word
    - Stun
    
    #### 9th Level
    - Foresight
    - Power Word Kill
    - True Polymorph
    
    ### Cleric Spells
    
    #### Cantrips (0 Level)
    - Guidance
    - Light
    - Mending
    - Resistance
    - Sacred Flame
    - Thaumaturgy
    
    #### 1st Level
    
    - Bane
    - Bless
    - Command
    - Create or Destroy Water
    - Cure Wounds
    - Detect Evil and Good
    - Detect Magic
    - Detect Poison and Disease
    - Guiding Bolt
    - Healing Word
    - Inflict Wounds
    - Protection from Evil and Good
    - Purify Food and Drink
    - Sanctuary
    - Shield of Faith
    
    #### 2nd Level
    
    - Aid
    - Augury
    - Blindness/Deafness
    - Calm Emotions
    - Continual Flame
    - Enhance Ability
    - Find Traps
    - Gentle Repose
    - Hold Person
    - Lesser Restoration
    - Locate Object
    - Prayer of Healing
    - Protection from Poison
    - Silence
    - Spiritual Weapon
    - Warding Bond
    - Zone of Truth
    
    #### 3rd Level
    - Animate Dead
    - Beacon of Hope
    - Bestow Curse
    - Clairvoyance
    - Create Food and Water
    - Daylight
    - Dispel Magic
    - Glyph of Warding
    - Magic Circle
    - Mass Healing Word
    - Meld into Stone
    - Protection from Energy
    - Remove Curse
    - Revivify
    - Sending
    - Speak with Dead
    - Spirit Guardians
    - Tongues
    - Water Walk
    
    #### 4th Level
    - Banishment
    - Control Water
    - Death Ward
    - Divination
    - Freedom of Movement
    - Locate Creature
    - Stone Shape
    
    #### 5th Level
    - Commune
    - Contagion
    - Dispel Evil and Good
    - Flame Strike
    - Geas
    - Greater Restoration
    - Hallow
    - Insect Plague
    - Legend
    - Lore
    - Mass Cure Wounds
    - Planar Binding
    - Raise Dead
    - Scrying
    
    #### 6th Level
    - Blade Barrier
    - Create Undead
    - Find the Path
    - Forbiddance
    - Harm
    - Heal
    - Heroes’ Feast
    - Planar Ally
    - True Seeing
    - Word of Recall
    
    #### 7th Level
    - Conjure Celestial
    - Divine Word
    - Etherealness
    - Fire Storm
    - Plane Shift
    - Regenerate
    - Resurrection
    - Symbol
    
    #### 8th Level
    - Antimagic Field
    - Control Weather
    - Earthquake
    - Holy Aura
    
    #### 9th Level
    - Astral Projection
    - Gate
    - Mass Heal
    - True Resurrection`
    const result = await loadSource({data, idProvider: () => "some-test-id-matching-schema"});
    expect(result).toMatchSnapshot();
    });

    it("should load large table", async () => {
        const data = `| Level | Proficiency Bonus | Features                                          | Spells Known | 1st | 2nd | 3rd | 4th | 5th |
        |-------|-------------------|---------------------------------------------------|--------------|-----|-----|-----|-----|-----|
        | 1st   | +2                | Favored Enemy, Natural Explorer                   | -            | -   | -   | -   | -   | -   |
        | 2nd   | +2                | Fighting Style, Spellcasting                      | 2            | 2   | -   | -   | -   | -   |
        | 3rd   | +2                | Ranger Archetype, Primeval Awareness              | 3            | 3   | -   | -   | -   | -   |
        | 4th   | +2                | Ability Score Improvement                         | 3            | 3   | -   | -   | -   | -   |
        | 5th   | +3                | Extra Attack                                      | 4            | 4   | 2   | -   | -   | -   |
        | 6th   | +3                | Favored Enemy and Natural Explorer improvements   | 4            | 4   | 2   | -   | -   | -   |
        | 7th   | +3                | Ranger Archetype feature                          | 5            | 4   | 3   | -   | -   | -   |
        | 8th   | +3                | Ability Score Improvement, Land’s Stride          | 5            | 4   | 3   | -   | -   | -   |
        | 9th   | +4                | -                                                 | 6            | 4   | 3   | 2   | -   | -   |
        | 10th  | +4                | Natural Explorer improvement, Hide in Plain Sight | 6            | 4   | 3   | 2   | -   | -   |
        | 11th  | +4                | Ranger Archetype feature                          | 7            | 4   | 3   | 3   | -   | -   |
        | 12th  | +4                | Ability Score Improvement                         | 7            | 4   | 3   | 3   | -   | -   |
        | 13th  | +5                | -                                                 | 8            | 4   | 3   | 3   | 1   | -   |
        | 14th  | +5                | Favored Enemy improvement, Vanish                 | 8            | 4   | 3   | 3   | 1   | -   |
        | 15th  | +5                | Ranger Archetype feature                          | 9            | 4   | 3   | 3   | 2   | -   |
        | 16th  | +5                | Ability Score Improvement                         | 9            | 4   | 3   | 3   | 2   | -   |
        | 17th  | +6                | -                                                 | 10           | 4   | 3   | 3   | 3   | 1   |
        | 18th  | +6                | Feral Senses                                      | 10           | 4   | 3   | 3   | 3   | 1   |
        | 19th  | +6                | Ability Score Improvement                         | 11           | 4   | 3   | 3   | 3   | 2   |
        | 20th  | +6                | Foe Slayer                                        | 11           | 4   | 3   | 3   | 3   | 2   |`;

        const result = await loadSource({data, idProvider: () => "some-test-id-matching-schema"});
        expect(result).toMatchSnapshot();
    })
});