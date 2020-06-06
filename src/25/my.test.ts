import "reflect-metadata";
import { describe } from "mocha";
import { createTestClient } from "apollo-server-testing";
import { server } from "./index";
import { assert } from "chai";

const { query, mutate } = createTestClient(server);

describe("chapter25", () => {
    //
    // Test hello.
    it("hello", async () => {
        const { data } = await query({
            query: ` 
            query {
                hello
            }
            `,
        });
        assert.deepEqual(data, {
            hello: "world!",
        });
    });

    //
    // Test byebye.
    it("byebye", async () => {
        const { data } = await query({
            query: ` 
            query {
                byebye
            }
            `,
        });
        assert.deepEqual(data, {
            byebye: "See you again!",
        });
    });
});
