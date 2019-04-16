import { plainToClass } from "class-transformer";

import { Recipe } from "./recipe";

export function createRecipeSamples() {
  return plainToClass(Recipe, [
    {
      id: 1,
      description: "Desc 1 - and some more text",
      title: "Recipe 1",
      ratings: [0, 3, 1],
      creationDate: new Date("2018-04-11")
    },
    {
      id: 2,
      description: "Desc 2 - and some more text",
      title: "Recipe 2",
      ratings: [4, 2, 3, 1],
      creationDate: new Date("2018-04-15")
    },
    {
      id: 3,
      description: "Desc 3 - and some more text",
      title: "Recipe 3",
      ratings: [5, 4],
      creationDate: new Date()
    }
  ]);
}
