import {
  Authorized,
  Resolver,
  Query,
  FieldResolver,
  Arg,
  Root,
  Mutation,
  Int,
  ResolverInterface
} from "type-graphql";
import { plainToClass } from "class-transformer";
import { Recipe } from "./recipe";
import { CreateRecipeInput, AddRatingInput } from "./recipe.inputs";
import { createRecipeSamples } from "./recipe.samples";

@Resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  private readonly recipeCollection: Recipe[] = createRecipeSamples();

  /**
  query {
    recipe(title: "Recipe 2") {
      description,
      creationDate,
      averageRating
    }
  }
  **/
  @Query(returns => Recipe, {
    nullable: true,
    description: "Get a specific recipe by its title"
  })
  async recipe(@Arg("title") title: string): Promise<Recipe | undefined> {
    return await this.recipeCollection.find(recipe => recipe.title === title);
  }

  /**
  query {
    recipes {
      title,
      description,
      ratings,
      creationDate,
      ratingsCount,
      averageRating
    }
  }
  **/
  @Query(returns => [Recipe], {
    description: "Get all the recipes from around the world"
  })
  async recipes(): Promise<Recipe[]> {
    return await this.recipeCollection;
  }

  @FieldResolver()
  ratingsCount(
    @Root() recipe: Recipe,
    @Arg("minRate", type => Int, { defaultValue: 0.0 }) minRate: number
  ): number {
    return recipe.ratings.filter(rating => rating >= minRate).length;
  }

  /**
  mutation {
    addRecipe(
      recipe: {
        title: "A new Title",
        description: "Description for the new recipe"
      }
    ){
      title,
      description,
      creationDate
    }
  }

  NOTE: 
  Must include token (any user) in header: 
    {"authorization": "UserLoginToken"}
  **/
  @Authorized()
  @Mutation(returns => Recipe, {
    description: "Add a new recipe. Requires a logged in users access token."
  })
  async addRecipe(
    @Arg("recipe") recipeInput: CreateRecipeInput
  ): Promise<Recipe> {
    var id = this.recipeCollection.length + 1;
    const recipe = plainToClass(Recipe, {
      id: id,
      description: recipeInput.description,
      title: recipeInput.title,
      ratings: [],
      creationDate: new Date()
    });
    await this.recipeCollection.push(recipe);
    return recipe;
  }

  /**
  mutation {
    removeRecipe(
      title: "Some Title"
    )
  }

  NOTE: 
  Must include admin user token in header: 
    {"authorization": "UserLoginToken"}
  **/
  @Authorized("Admin")
  @Mutation(returns => Boolean, {
    description: "Add a new recipe. Requires an admin access token."
  })
  async removeRecipe(@Arg("title") title: string): Promise<Boolean> {
    var result = false;
    try {
      for (var [index, recipe] of this.recipeCollection.entries()) {
        //this.recipeCollection.forEach((recipe, index) => {
        if (recipe.title === title) {
          this.recipeCollection.splice(index, 1);
          result = true;
        }
      }
    } catch (Exception) {
      result = false;
    }
    return result;
  }

  /**
  mutation {
    addRating(
      recipe:{
      title: "abc",
      rating: 1
    })
  }

  NOTE: 
  Must include token (any user) in header: 
    {"authorization": "UserLoginToken"}
  **/
  @Authorized()
  @Mutation(returns => Boolean, {
    description:
      "Add a new rating to a recipe. Requires a logged in users access token."
  })
  async addRating(
    @Arg("recipe") ratingInput: AddRatingInput
  ): Promise<Boolean> {
    var result = false;
    try {
      for (var [index, recipe] of this.recipeCollection.entries()) {
        if (recipe.title === ratingInput.title) {
          recipe.ratings.push(ratingInput.rating);
          result = true;
        }
      }
    } catch (Exception) {
      result = false;
    }
    return result;
  }
}
