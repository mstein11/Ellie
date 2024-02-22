import { VectoreStoreRepository } from "./VectorstoreRepository";

jest.setTimeout(30000);

describe("should test dataloader", () => {

    it.skip("should test dataloader", async () => {

        const repo = new VectoreStoreRepository({ config: { tableName: "documents_unittest", functionName: "match_documents_unittest" } });
        await repo.initStore();

    });

    it("should load conent ordered", async () => {
        const repo = new VectoreStoreRepository({ config: { tableName: "documents_unittest", functionName: "match_documents_unittest" } });

        const res = await repo.getAsContent();
        expect(res).toMatchSnapshot();


    });

});