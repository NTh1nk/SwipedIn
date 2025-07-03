import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch jobs from the 'jobs' table
export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('jobid, company_name, job_title, description_text, location, salary_formatted')
    .limit(20);

  if (error) throw error;
  return data;
}