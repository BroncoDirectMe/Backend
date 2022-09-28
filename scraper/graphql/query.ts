// gql stands for "graphql" and is a method in the "graphql-request" package that allows graphql users to create queries
import { gql } from 'graphql-request';

// query in which data is returned for a list of professor //

// query definitions:
// firstName                teachers first name
// lastName                 teachers last name
// id                       id associated with teachers - used to search teacher in DB
export const professorQuery = gql`
  query NewSearchTeachersQuery($count: Int!, $schoolID: ID!, $text: String!) {
    newSearch {
      teachers(query: { schoolID: $schoolID, text: $text }, first: $count) {
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
  }
`;

// for a specific professor //

// query definitions:
// firstName                teachers first name
// lastName                 teachers last name
// avgDifficulty            score out of 5 - how hard of a teacher they are
// avgRatings               score out of 5 - overall teacher score
// wouldTakeAgainPercentage % out of 100 - how many would take this class again
// id                       id associated with teachers - used to search teacher in DB
// legacyId                 teachers id translated to a series of numbers - used to create a direct URL
//                          ex. legacyId = 2210505
//                              the url would be = https://www.ratemyprofessors.com/ShowRatings.jsp?tid=2210505
export const professorRatingQuery = gql`
  query TeacherRatingsPageQuery($id: ID!) {
    node(id: $id) {
      ... on Teacher {
        firstName
        lastName
        avgDifficulty
        avgRating
        numRatings
        wouldTakeAgainPercent
        id
        legacyId
      }
    }
  }
`;
