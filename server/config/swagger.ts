import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Smart Tourism Guide API',
      version:     '1.0.0',
      description: `REST API for the Smart Tourism Guide System.

**Authentication:**
- Public endpoints (GET) require no token — tourists access them freely via NFC, QR, GPS.
- Admin endpoints (POST, PUT, DELETE) require a Bearer JWT token.
- To get a token: call \`POST /api/admin/login\`, then click **Authorize** and paste the token.`,
    },
    servers: [{ url: 'http://localhost:4000/api', description: 'Local development' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'Get your token from POST /api/admin/login then paste it here.',
        },
      },
      schemas: {
        TourismObject: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            name:        { type: 'string',  example: 'African Elephant' },
            type:        { type: 'string',  example: 'animal', description: 'animal | bird | tree | landmark' },
            description: { type: 'string',  example: 'The largest land animal on Earth.' },
            imageUrl:    { type: 'string',  nullable: true, example: 'https://res.cloudinary.com/demo/image/upload/smart-tourism/images/elephant.jpg' },
            audioUrl:    { type: 'string',  nullable: true, example: 'https://res.cloudinary.com/demo/video/upload/smart-tourism/audio/elephant.mp3' },
            latitude:    { type: 'number',  example: -1.9441 },
            longitude:   { type: 'number',  example: 30.0619 },
            nfcId:       { type: 'string',  nullable: true, example: 'NFC-001' },
            qrCode:      { type: 'string',  nullable: true, example: 'QR-001' },
            createdAt:   { type: 'string',  format: 'date-time' },
            updatedAt:   { type: 'string',  format: 'date-time' },
          },
        },
        PaginatedObjects: {
          type: 'object',
          properties: {
            data:       { type: 'array', items: { $ref: '#/components/schemas/TourismObject' } },
            total:      { type: 'integer', example: 42 },
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        Zone: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            zoneName:     { type: 'string',  example: 'Entrance Gate' },
            radius:       { type: 'integer', example: 50, description: 'Radius in metres' },
            latitude:     { type: 'number',  example: -1.9441 },
            longitude:    { type: 'number',  example: 30.0619 },
            triggerAudio: { type: 'string',  nullable: true, example: 'Welcome to the park!' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string', example: 'Object not found.' } },
        },
      },
    },
    paths: {
      '/admin/login': {
        post: {
          tags:        ['Admin Auth'],
          summary:     'Admin login',
          description: 'Returns a JWT token. Copy the token value and click **Authorize** at the top of this page to unlock admin endpoints.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', example: 'your_admin_password' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful — copy the token and use Authorize button',
              content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } } } },
            },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/objects': {
        get: {
          tags:        ['Objects — Public'],
          summary:     'List all tourism objects (paginated)',
          description: 'No auth required. Returns a paginated list. Filter by type with the `type` query param.',
          parameters: [
            { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 },  description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page (max 100)' },
            { name: 'type',  in: 'query', schema: { type: 'string' },               description: 'Filter: animal | bird | tree | landmark' },
          ],
          responses: {
            200: { description: 'Paginated objects', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedObjects' } } } },
          },
        },
        post: {
          tags:        ['Objects — Admin'],
          summary:     'Create a tourism object 🔒',
          description: 'Requires admin token. Upload image and/or audio files — both are stored on Cloudinary. You can also provide `audioUrl` as a text URL instead of uploading a file.',
          security:    [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name', 'type', 'description', 'latitude', 'longitude'],
                  properties: {
                    name:        { type: 'string',  example: 'African Elephant' },
                    type:        { type: 'string',  example: 'animal', description: 'animal | bird | tree | landmark' },
                    description: { type: 'string',  example: 'Largest land animal in Africa.' },
                    latitude:    { type: 'number',  example: -1.9441 },
                    longitude:   { type: 'number',  example: 30.0619 },
                    nfcId:       { type: 'string',  example: 'NFC-001', description: 'Must be unique' },
                    qrCode:      { type: 'string',  example: 'QR-001',  description: 'Must be unique' },
                    audioUrl:    { type: 'string',  example: 'https://cdn.example.com/audio.mp3', description: 'Use this OR upload an audio file below' },
                    image:       { type: 'string',  format: 'binary', description: 'Image file (jpg/png/webp) — uploaded to Cloudinary' },
                    audio:       { type: 'string',  format: 'binary', description: 'Audio file (mp3/wav/ogg/m4a) — uploaded to Cloudinary' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Object created',   content: { 'application/json': { schema: { $ref: '#/components/schemas/TourismObject' } } } },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized — missing or invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'nfcId or qrCode already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/objects/nearby': {
        get: {
          tags:        ['Objects — Public'],
          summary:     'Get nearby tourism objects',
          description: 'No auth required. Returns objects within `radius` metres of the given GPS coordinates.',
          parameters: [
            { name: 'lat',    in: 'query', required: true,  schema: { type: 'number' }, example: -1.9441 },
            { name: 'lng',    in: 'query', required: true,  schema: { type: 'number' }, example: 30.0619 },
            { name: 'radius', in: 'query', schema: { type: 'number', default: 200 },   description: 'Search radius in metres' },
          ],
          responses: {
            200: { description: 'Nearby objects', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/TourismObject' } } } } },
            400: { description: 'Invalid coordinates', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/objects/{id}': {
        get: {
          tags:        ['Objects — Public'],
          summary:     'Get a tourism object by ID',
          description: 'No auth required.',
          parameters:  [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
          responses: {
            200: { description: 'Object found', content: { 'application/json': { schema: { $ref: '#/components/schemas/TourismObject' } } } },
            404: { description: 'Not found',    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          tags:        ['Objects — Admin'],
          summary:     'Update a tourism object 🔒',
          description: 'Requires admin token. All fields are optional — only send what you want to change. Upload a new image or audio file to replace existing ones on Cloudinary.',
          security:    [{ BearerAuth: [] }],
          parameters:  [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name:        { type: 'string' },
                    type:        { type: 'string' },
                    description: { type: 'string' },
                    latitude:    { type: 'number' },
                    longitude:   { type: 'number' },
                    nfcId:       { type: 'string' },
                    qrCode:      { type: 'string' },
                    audioUrl:    { type: 'string', description: 'Use this OR upload an audio file below' },
                    image:       { type: 'string', format: 'binary', description: 'Replaces existing image on Cloudinary' },
                    audio:       { type: 'string', format: 'binary', description: 'Replaces existing audio on Cloudinary' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Updated',    content: { 'application/json': { schema: { $ref: '#/components/schemas/TourismObject' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Not found',  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Duplicate nfcId or qrCode', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags:        ['Objects — Admin'],
          summary:     'Delete a tourism object 🔒',
          description: 'Requires admin token. Also removes the image from Cloudinary.',
          security:    [{ BearerAuth: [] }],
          parameters:  [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
          responses: {
            200: { description: 'Deleted',      content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Object deleted successfully.' } } } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Not found',    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/objects/nfc/{nfcId}': {
        get: {
          tags:        ['NFC / QR — Public'],
          summary:     'Resolve object by NFC tag',
          description: 'No auth required. Called when a tourist taps an NFC tag.',
          parameters:  [{ name: 'nfcId', in: 'path', required: true, schema: { type: 'string' }, example: 'NFC-001' }],
          responses: {
            200: { description: 'Object found', content: { 'application/json': { schema: { $ref: '#/components/schemas/TourismObject' } } } },
            404: { description: 'Not found',    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/objects/qr/{qrCode}': {
        get: {
          tags:        ['NFC / QR — Public'],
          summary:     'Resolve object by QR code',
          description: 'No auth required. Called when a tourist scans a QR code.',
          parameters:  [{ name: 'qrCode', in: 'path', required: true, schema: { type: 'string' }, example: 'QR-001' }],
          responses: {
            200: { description: 'Object found', content: { 'application/json': { schema: { $ref: '#/components/schemas/TourismObject' } } } },
            404: { description: 'Not found',    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/ai/chat': {
        post: {
          tags:        ['AI Assistant — Public'],
          summary:     'Ask the AI assistant',
          description: 'No auth required. Phase 1 uses predefined keyword responses. Phase 3 will use OpenAI/Gemini.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['question'],
                  properties: {
                    question: { type: 'string',  example: 'Tell me about the elephants.' },
                    objectId: { type: 'integer', nullable: true, example: 1 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'AI answer', content: { 'application/json': { schema: { type: 'object', properties: { answer: { type: 'string', example: 'The African elephant is the largest land animal...' } } } } } },
            400: { description: 'Question required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/geofence/check': {
        post: {
          tags:        ['Geofencing — Public'],
          summary:     'Check geofence zones for a coordinate',
          description: 'No auth required. Used by the frontend to auto-trigger audio when a tourist enters a zone.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['lat', 'lng'],
                  properties: {
                    lat: { type: 'number', example: -1.9441 },
                    lng: { type: 'number', example: 30.0619 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Matching zones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Zone' } } } } },
            400: { description: 'lat and lng required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
