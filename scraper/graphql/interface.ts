// interfaces are used when we make a query request to ratemyprofessor.com/graphql
// used when we format the returned data
export interface professor_search {
  id: string
  firstName: string
  lastName: string
}

export interface professor_page {
  firstName: string
  lastName: string
  avgDifficulty: number
  avgRating: number
  numRatings: number
  legacyId: number
  id: number
}