export interface Professor {
  profName: string;
  firstName: string;
  lastName: string;
  avgDifficulty: number;
  avgRating: number;
  numRatings: number;
  wouldTakeAgainPercent: number;
  id: string;
  legacyId: number;
}

export interface ProfessorUpdate {
  profName: string;
  avgDifficulty: number;
  avgRating: number;
  numRatings: number;
  wouldTakeAgainPercent: number;
}
