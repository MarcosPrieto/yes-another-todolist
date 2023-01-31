import { Pool } from 'pg';

const connectionString = process.env.DATABASE_CONNECTION;

export const pool = new Pool({connectionString});

