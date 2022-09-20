// gql stands for "graphql" and is a method in the "graphql-request" package that allows graphql users to create queries
import { gql } from 'graphql-request'

// query in which data is returned
// for a list of professor
export const professorQuery = gql`
query NewSearchTeachersQuery($count: Int!, $schoolID: ID!, $text: String!) {
  newSearch {
    teachers(query: {schoolID: $schoolID, text: $text}, first: $count) {
      edges {
        cursor
          node {
            id
            firstName
            lastName
          }
        }
      }
    }
}`

// for a specific professor
export const professorRatingQuery = gql`
query TeacherRatingsPageQuery($id: ID!) {
  node(id: $id) {
    ... on Teacher {
      firstName
      lastName
      avgDifficulty
      avgRating
      numRatings
      legacyId
      id
    }
  }
}`

// id = used to search
// legacyId = used to create url