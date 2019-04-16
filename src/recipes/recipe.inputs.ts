import { Recipe } from "./recipe";
import { InputType, Field } from "type-graphql";
import { Length, MaxLength, Min, Max, IsInt } from "class-validator";

@InputType()
export class CreateRecipeInput implements Partial<Recipe> {
  @Field()
  @MaxLength(50)
  title: string;

  @Field({ nullable: true })
  @Length(10, 255)
  description?: string;
}

@InputType()
export class AddRatingInput implements Partial<Recipe> {
  @Field()
  @MaxLength(50)
  title: string;

  @Field()
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;
}
