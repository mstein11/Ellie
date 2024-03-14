import { getChain, getChainWithRephrase } from "./chain";


jest.setTimeout(300000);

describe("chain", () => {
    it ("should test chain", async  () => {
        const chain = await getChain();

        const res = await chain.invoke({input: "What are the monster stats for a Goblin?"});
        new TextDecoder().decode(res); 

        //expect no error
    });

    it("should test rephraseChain with no history", async ()=> {
        const chain = await getChainWithRephrase();
        const res = await chain.invoke({input: "What are the monster stats for a Goblin?", chat_history: ""});
        
        console.log(new TextDecoder().decode(res));
    });
});