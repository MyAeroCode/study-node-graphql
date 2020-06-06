import { GraphQLScalarType } from "graphql";

export const GraphQLBuffer = new GraphQLScalarType({
    name: "Buffer",
    description: "The `Buffer` scalar type represents a Uint8Array.",

    parseValue: (value) => {
        //
        // if buffer object.
        if (value?.type === "Buffer") {
            return Buffer.from(value.data as number[]);
        }

        //
        // if int[].
        if (value?.constructor === Array) {
            return Buffer.from(value as number[]);
        }

        //
        // else.
        throw new Error("`Buffer` must be a Buffer or a Uint8Array.");
    },

    parseLiteral(value) {
        throw new Error("`Buffer` does not support literal.");
    },

    serialize(value) {
        if (value.constructor !== Buffer) {
            throw new Error(
                `"Buffer" must be a Buffer. But found ${value.constructor.name}.`
            );
        }
        return [...value];
    },
});
