// graphql & request module that handles the data (includes graphql, request, and a few others)
import { GraphQLClient } from 'graphql-request'
// explained in respective file
import { AUTH_TOKEN, SCHOOL_ID, WEB_URL} from './graphql/const'
import { professor_query, professor_rating_query } from './graphql/query'
import { professor_search, professor_page } from './graphql/interface'

// client object where the url and authorization token are combined
const graphQLClient = new GraphQLClient(WEB_URL, {
  headers: {
    authorization: `Basic ${AUTH_TOKEN}`
  },
})

// returns a list of professrs in JSON format
// takes in a string of professors searched name (example get_professor_by_name('kevin chun') ) 
// returned Promise with firstName, lastName, and id (used to query that professor)
const get_professor_name = async (name:string): Promise<professor_search[]> => {
  const professor_search_list = await graphQLClient.request(professor_query, {
    'schoolID': SCHOOL_ID,
    'text': name,
    'count': 2500 // ~2,400 professors on campus (returns up to 2,500 names)
  })
  return await professor_search_list.newSearch.teachers.edges.map((edge: { node: professor_search }) => edge.node)
}

// returns a professor's data based on an id
// returned Promise with firstName, lastNam'e, id, legacyId, avgDifficulty, avgRating, numRatings
// example get_professor_data('VGVhY2hlci0yMzM0Nzcy')
const get_professor_data = async (id: string): Promise<professor_page[]> => {
  const professor_search_data = await graphQLClient.request(professor_rating_query, {
    'id': id
  })
  return await professor_search_data.node
}

// CALLABLE FUNCTIONS //

// returns an array for all professors
// [refer to get_professor_name]
export const get_all_professor = async () => {
  // ratemyprofessor.com uses the * to refer to all
  const all_professor = await get_professor_name('*')
  return all_professor
}

// returns a Promise of a professors data
// will only return if full name is matched
export const get_professor = async (name: string) => {
  // searches RMP by professors name
  const get_professor_results = await get_professor_name(name)

  // if only 1 result appears for that professor
  if (get_professor_results.length == 1) {
    // professor id which is used to query the professor data
    const professor_id = get_professor_results[0].id
    // returns promise object of the professors data
    const professor = await get_professor_data(professor_id)
    return professor
  }
}