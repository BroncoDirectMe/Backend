// graphql & request module that handles the data (includes graphql, request, and a few others)
import { GraphQLClient } from 'graphql-request';
// explained in respective file
import { AUTH_TOKEN, SCHOOL_ID, WEB_URL } from './graphql/const';
import { professorQuery, professorRatingQuery } from './graphql/query';
import { ProfessorSearch, ProfessorPage } from './graphql/interface';

// client object where the url and authorization token are combined
const graphQLClient = new GraphQLClient(WEB_URL, {
  headers: {
    authorization: `Basic ${AUTH_TOKEN}`,
  },
});

// returns a list of professrs in JSON format
// takes in a string of professors searched name (example getProfessorSearch('kevin chun') )
// returned Promise with firstName, lastName, and id (used to query that professor)
const getProfessorSearch = async (name: string): Promise<ProfessorSearch[]> => {
  const professorSearchList = await graphQLClient.request(professorQuery, {
    schoolID: SCHOOL_ID,
    text: name,
    count: 2500, // ~2,400 professors on campus (returns up to 2,500 names)
  });
  return professorSearchList.newSearch.teachers.edges.map(
    (edge: { node: ProfessorSearch }) => edge.node
  );
};

// returns a professor's data based on an id
// returned Promise with firstName, lastNam'e, id, legacyId, avgDifficulty, avgRating, numRatings
// example getProfessorData('VGVhY2hlci0yMzM0Nzcy')
const getProfessorData = async (id: string): Promise<ProfessorPage[]> => {
  const professorSearchData = await graphQLClient.request(
    professorRatingQuery,
    {
      id: id,
    }
  );
  return professorSearchData.node;
};

// CALLABLE FUNCTIONS //

// returns an array for all professors
// [refer to getProfessorName]
export const getAllProfessor = async (): Promise<ProfessorSearch[]> => {
  // ratemyprofessor.com uses the * to refer to all
  const allProfessor = await getProfessorSearch('*');
  return allProfessor;
};

// returns a Promise of a professors data
// will only return if full name is matched
export const getProfessorByName = async (
  name: string
): Promise<ProfessorPage[] | null> => {
  // searches RMP by professors name
  const getProfessorResults = await getProfessorSearch(name);

  // if only 1 result appears for that professor
  if (getProfessorResults.length === 1) {
    // professor id which is used to query the professor data
    const professorId = getProfessorResults[0].id;
    // returns promise object of the professors data
    const professor = await getProfessorData(professorId);
    return professor;
  }
  return null;
};
