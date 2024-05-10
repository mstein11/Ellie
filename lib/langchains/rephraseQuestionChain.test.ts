import { getrephraseQuestionChain } from "./rephraseQuestionChain";

jest.setTimeout(300000);

describe("chain", () => {

    it.skip("should test rephraseChain with no history", async ()=> {
        const chain = await getrephraseQuestionChain();
        const res = await chain.invoke({input: "What are the monster stats for a Goblin?", chat_history: ""});
        
        console.log(res);
    });
});