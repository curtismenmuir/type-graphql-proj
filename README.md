# type-graphql-Proj

## Development

When developing this project locally, hot-reloading is configured with nodemon for testing.
Execute the following command before making change to launch a local instance which will update on save:
`npm run build:dev`

256 bit JWT Secret generated using: https://passwordsgenerator.net/

## Builds

Project built from root dir with the following command:
`npm run start`

IMPORTANT:

- schema.gql must be updated before building the project.
- This is done by executing the following command in the projects root dir:
  `npm run build:dev`

## Queries

Users:

```javascript
1: query {
    user(username:"User1") {
      username
    }
  }

2: query {
    users {
      username
    }
  }

3: query {
    loginUser(user: {
      username:"User1",
      password:"Password123"
    })
  }
```

Recipes:

```javascript
1: query {
    recipe(title: "Recipe 2") {
      description,
      creationDate,
      averageRating
    }
  }

2: query {
    recipes {
      title,
      description,
      ratings,
      creationDate,
      ratingsCount,
      averageRating
    }
  }
```

## Mutations

Users

```javascript
1: mutation {
    addUser(
      user: {
        username: "NewUser2",
        password: "Password123",
        accountType: 0
      }
    ){
      username
    }
  }

  NOTE:
  Must include admin user token in header

2: mutation {
    removeUser(username: "NewUser3")
  }

  NOTE:
  Must include admin user token in header
```

Recipes:

```javascript
1: mutation {
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
  Must include token (any user) in header

2:  mutation {
    removeRecipe(
      title: "Some Title"
    )
  }

  NOTE:
  Must include admin user token in header

3: mutation {
    addRating(
      recipe:{
      title: "abc",
      rating: 1
    })
  }

  NOTE:
  Must include token (any user) in header
```
