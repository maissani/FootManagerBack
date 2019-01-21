import axios from 'axios'

const API_URL = 'http://localhost:8000/graphql'

export const user = async variables =>
  axios.post(API_URL, {
    query: `
      query ($id: ID!) {
        user(id: $id) {
          id
          firstname
          lastname
          username
          email
          role
        }
      }
    `,
    variables
  })

export const signIn = async variables => {
  const signInMutation = await axios.post(API_URL, {
    query: `
      mutation ($login: String!, $password: String!) {
        signIn(login: $login, password: $password) {
          token
        }
      }
    `,
    variables
  })
  return signInMutation
}

export const deleteUser = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables
    },
    {
      headers: {
        'x-token': token
      }
    }
  )
