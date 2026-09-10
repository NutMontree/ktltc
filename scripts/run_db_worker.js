const path = require('path');
const dotenv = require('dotenv');

// 1. Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Register ts-node with CommonJS module configuration
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  },
  transpileOnly: true
});

// 3. Execute the worker script
require('../src/workers/dbWorker.ts');
