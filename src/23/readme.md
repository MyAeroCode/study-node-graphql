### Logging

`Apollo Plugin`을 사용하면 매 이벤트의 자세한 정보를 얻을 수 있습니다. 이 정보를 얻어 로거에 기록하세요. `Plugin`에 대한 자세한 사항은 `Chapter 16`에서 확인할 수 있습니다.

```ts
export const server = new ApolloServer({
    schema,
    plugins: [
        {
            // Fires whenever a GraphQL request is received from a client.
            requestDidStart(requestContext) {
                console.log(
                    "Request started! Query:\n" + requestContext.request.query
                );

                return {
                    // Fires whenever Apollo Server will parse a GraphQL
                    // request to create its associated document AST.
                    parsingDidStart(requestContext) {
                        console.log("Parsing started!");
                    },

                    // Fires whenever Apollo Server will validate a
                    // request's document AST against your GraphQL schema.
                    validationDidStart(requestContext) {
                        console.log("Validation started!");
                    },
                };
            },
        },
    ],
});
```
