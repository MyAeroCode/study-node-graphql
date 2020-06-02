import { ObjectType, Field, Resolver, Query, Float } from "type-graphql";

//
// ObjectType Inheritance - Abstract
@ObjectType()
abstract class DataMapper {
    protected items: number[] = [];

    //
    // 아직 결정되지 않음.
    // 추상 메소드에는 데코레이터를 사용할 수 없음.
    abstract map(): number[];

    @Field(() => [Float])
    getMapped(): number[] {
        return this.map();
    }
}

@ObjectType()
class TwiceMapper extends DataMapper {
    constructor() {
        super();
        this.items = [1, 2, 3, 4, 5];
    }

    map() {
        return this.items.map((v) => v * 2);
    }
}

@ObjectType()
class HalfMapper extends DataMapper {
    constructor() {
        super();
        this.items = [1, 2, 3, 4, 5];
    }

    map() {
        return this.items.map((v) => v * 0.5);
    }
}

@Resolver()
export class DataMapperQueryResolver {
    @Query(() => DataMapper)
    randomMapper(): DataMapper {
        return Math.random() < 0.5 ? new TwiceMapper() : new HalfMapper();
    }

    @Query(() => TwiceMapper)
    twiceMapper(): TwiceMapper {
        return new TwiceMapper();
    }

    @Query(() => HalfMapper)
    halfMapper(): HalfMapper {
        return new HalfMapper();
    }
}
