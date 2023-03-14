// interfaces are used when we make a query request to ratemyprofessor.com/graphql
// used when we format the returned data
export interface ProfessorSearch {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ProfessorPage {
  firstName: string;
  lastName: string;
  avgDifficulty: number;
  avgRating: number;
  numRatings: number;
  wouldTakeAgainPercent: number;
  legacyId: number;
  id: number;
}
