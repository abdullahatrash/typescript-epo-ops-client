import { Client, DocdbModel, Throttler, Dogpile } from '../src';

async function main() {
  // Initialize client with both throttling and caching
  const client = new Client({
    key: process.env.EPO_KEY || '',
    secret: process.env.EPO_SECRET || '',
    middlewares: [
      new Dogpile(),
      new Throttler()
    ]
  });

  try {
    // Get bibliographic data for a patent
    const response = await client.publishedData(
      'publication',
      new DocdbModel('1000000', 'EP', 'A1'),
      'biblio'
    );
    console.log('Patent data:', response.data);

    // Search for patents
    const searchResponse = await client.publishedDataSearch(
      'ta=computer AND pd=2020',
      1,
      25
    );
    console.log('Search results:', searchResponse.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 
