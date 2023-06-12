import fetch from 'node-fetch';

const defaultQuery = `
query Hello {
  hello
}
`;

export const sendGraphQL = async (input?: { query?: string; variables?: any }) => {
  const body = JSON.stringify({
    query: input?.query ?? defaultQuery,
    variables: input?.variables ?? {},
  });

  return fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length.toString(),
    },
    body,
  })
    .then(async (res) => {
      console.log(res);
      const data = await res.json();
      console.dir(data, { depth: 6 });
      return data;
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
