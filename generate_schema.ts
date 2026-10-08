import { generateCompleteSqlDump } from './src/utils/dataExports';
import { INITIAL_DRUGS, INITIAL_SUPPLIERS, INITIAL_INVOICES, INITIAL_ORDERS, INITIAL_CONSULTATIONS } from './src/data/initialData';
import fs from 'fs';

const sql = generateCompleteSqlDump(
  INITIAL_DRUGS, 
  INITIAL_SUPPLIERS, 
  INITIAL_INVOICES, 
  INITIAL_ORDERS, 
  INITIAL_CONSULTATIONS
);

fs.writeFileSync('supabase_schema.sql', sql);
console.log('Schema generated to supabase_schema.sql');
