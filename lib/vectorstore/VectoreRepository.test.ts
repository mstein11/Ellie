import { VectoreStoreRepository } from "./VectorstoreRepository";

jest.setTimeout(300000);

describe("should test dataloader", () => {

    it.only("should test dataloader", async () => {

        const repo = new VectoreStoreRepository();
        await repo.initStore();

    });

    it("should load conent ordered", async () => {
        const repo = new VectoreStoreRepository();

        const res = await repo.getAsContent();
        expect(res).toMatchSnapshot();


    });

});