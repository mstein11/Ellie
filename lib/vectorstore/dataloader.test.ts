import { loadSource } from "./dataloader";
import racesdata from './data/rulebook-01-races-srd';

describe("should test dataloader", () => {
    it("should test dataloader", async () => {
        const result = await loadSource({idProvider: () => "some-test-id-matching-schema"});
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