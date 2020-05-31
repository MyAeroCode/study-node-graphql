import "reflect-metadata";

import { ApolloServer } from "apollo-server";

async function bootstrap() {
    try {
        /**
         * 두 자리 정수로 변환한다.
         */
        function formatNumber(num: number): string {
            const prefix = num < 10 ? "0" : "";
            return prefix + num;
        }

        //
        // 주어진 챕터의 서버를 실행시킨다.
        const chapter = `./${formatNumber(Number(process.argv[2]))}`;
        const server = (await import(chapter)).server as ApolloServer;
        const serverInfo = await server.listen();

        //
        // 실행중인 서버의 경로를 출력한다.
        console.log(`Server ready at ${serverInfo.url}`);
    } catch (e) {
        console.error(e);
    }
}
bootstrap();
