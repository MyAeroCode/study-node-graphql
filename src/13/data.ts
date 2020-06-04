import Container from "typedi";

export enum Key {
    ARRAY = "SAMPLE_ARRAY_KEY",
    FLOAT = "SAMPLE_FLOAT_KEY",
}
const array = [1, 2, 3, 4, 5];
const float = 3.14159;
Container.set({ id: Key.ARRAY, factory: () => array });
Container.of("special").set({ id: Key.FLOAT, factory: () => float });
