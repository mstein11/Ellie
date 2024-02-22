import { loadSource } from "./dataloader";
import racesdata from './data/rulebook-01-races-srd';

describe("should test dataloader", () => {
    it("should test dataloader", async () => {

        const result = await loadSource();
        const toMatch = result.documents.map(doc => doc.pageContent).join("\n\n");
        console.log(result.documents.map(doc => JSON.stringify(doc.metadata)));
        expect(toMatch).toEqual(racesdata);
        // const vectoreStoreRepository = new VectoreStoreRepository();
        // await vectoreStoreRepository.initStore();
    });
});