# typescript-epo-ops-client

A TypeScript client for the European Patent Office's Open Patent Services (EPO OPS) API v3.2.

## Features

- Full TypeScript support
- Automatic token handling and renewal
- Request throttling
- Optional response caching
- Proper error handling for quota limits
- Support for all major EPO OPS endpoints

## Installation

```bash
npm install typescript-epo-ops-client
```

## Usage

### Basic Usage

```typescript
import { Client, DocdbModel } from 'typescript-epo-ops-client';

const client = new Client({
  key: 'your-key',
  secret: 'your-secret'
});

// Get bibliographic data for a patent
const response = await client.publishedData(
  'publication',
  new DocdbModel('1000000', 'EP', 'A1'),
  'biblio'
);
```

### With Caching

```typescript
import { Client, Throttler, Dogpile } from 'typescript-epo-ops-client';

const middlewares = [
  new Dogpile(),  // Cache middleware should be first
  new Throttler()
];

const client = new Client({
  key: 'your-key',
  secret: 'your-secret',
  middlewares
});
```

### Available Methods

- `publishedData` - Retrieve published patent data
- `family` - Get patent family information
- `publishedDataSearch` - Search published patents
- `image` - Retrieve patent images
- `number` - Convert between different patent number formats

### Error Handling

```typescript
import { 
  Client, 
  DocdbModel, 
  IndividualQuotaPerHourExceeded, 
  RegisteredQuotaPerWeekExceeded 
} from 'typescript-epo-ops-client';

try {
  const response = await client.publishedData(
    'publication',
    new DocdbModel('1000000', 'EP', 'A1')
  );
} catch (error) {
  if (error instanceof IndividualQuotaPerHourExceeded) {
    console.log('Hourly quota exceeded');
  } else if (error instanceof RegisteredQuotaPerWeekExceeded) {
    console.log('Weekly quota exceeded');
  }
}
```

## Development

### Setup

```bash
git clone https://github.com/yourusername/typescript-epo-ops-client.git
cd typescript-epo-ops-client
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## License

Apache-2.0 
