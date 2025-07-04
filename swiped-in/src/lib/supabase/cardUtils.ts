import { supabase } from './client'

// Type for jobs from the database
export type Job = {
  jobid?: number
  job_title: string
  company_name: string
  location: string
  salary_formatted?: string
  company_rating?: number
}

// Type for the game's scenario format
export type ClientScenario = {
  situation: string
  job_title: string
  company_name: string
  location: string
  salary?: string
  company_rating?: number
  optionA: { text: string; id: number }
  optionB: { text: string; id: number }
}

// Load jobs from the database with pagination
export async function loadJobsFromDatabase(offset: number = 0, limit: number = 10): Promise<Job[]> {
  try {
    console.log(`Loading jobs from database (offset: ${offset}, limit: ${limit})...`);
    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('job_title, company_name, location, salary_formatted, company_rating')
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error loading jobs from database:', error)
      throw error
    }

    console.log("Jobs loaded from database:", data);
    return data || []
  } catch (error) {
    console.error('Failed to load jobs from database:', error)
    return []
  }
}

// Transform database jobs into game scenarios
export function transformJobsToScenarios(jobs: Job[]): ClientScenario[] {
  console.log("Transforming jobs to scenarios:", jobs);
  const scenarios = jobs.map((job, index) => {
    // Create the situation text using job details (without salary)
    const situation = `${job.job_title} at ${job.company_name} (${job.location})`
    
    // Default choices for job scenarios - always ensure these are set
    const optionA = { text: 'Decline', id: job.jobid || index }
    const optionB = { text: 'Apply', id: job.jobid || index }

    return {
      situation,
      job_title: job.job_title,
      company_name: job.company_name,
      location: job.location,
      salary: job.salary_formatted || undefined,
      company_rating: job.company_rating,
      optionA,
      optionB,
    }
  });
  console.log("Transformed scenarios:", scenarios);
  return scenarios;
}

// Ensure a scenario has valid default options
export function ensureDefaultOptions(scenario: ClientScenario): ClientScenario {
  return {
    ...scenario,
    optionA: {
      text: scenario.optionA?.text || 'Decline',
      id: scenario.optionA?.id || 0
    },
    optionB: {
      text: scenario.optionB?.text || 'Apply', 
      id: scenario.optionB?.id || 0
    }
  }
}

// Load and transform jobs for the game
export async function loadGameScenarios(offset: number = 0): Promise<ClientScenario[]> {
  try {
    const jobs = await loadJobsFromDatabase(offset, 10)
    console.log("Jobs loaded:", jobs);
    const scenarios = transformJobsToScenarios(jobs)
    // Ensure all scenarios have valid default options
    return scenarios.map(ensureDefaultOptions)
  } catch (error) {
    console.error('Failed to load game scenarios:', error)
    return []
  }
}

// Load more scenarios (for infinite scrolling)
export async function loadMoreScenarios(currentCount: number): Promise<ClientScenario[]> {
  return loadGameScenarios(currentCount)
}

// Create a new job in the database
export async function createJob(jobData: {
  job_title: string
  company_name: string
  location: string
  salary_formatted?: string
}): Promise<Job | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('jobs')
      .insert([jobData])
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to create job:', error)
    return null
  }
}

// Update a job in the database
export async function updateJob(jobid: number, updates: Partial<Job>): Promise<Job | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('jobs')
      .update(updates)
      .eq('jobid', jobid)
      .select()
      .single()

    if (error) {
      console.error('Error updating job:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to update job:', error)
    return null
  }
}

// Delete a job from the database
export async function deleteJob(jobid: number): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('jobs')
      .delete()
      .eq('jobid', jobid)

    if (error) {
      console.error('Error deleting job:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Failed to delete job:', error)
    return false
  }
}

// Test function to demonstrate default options functionality
export function testDefaultOptions() {
  const testScenarios: ClientScenario[] = [
    {
      situation: "Normal job",
      job_title: "Software Engineer",
      company_name: "TechCorp",
      location: "Remote",
      salary: "$80,000 - $100,000",
      company_rating: 4.5,
      optionA: { text: "Custom Decline", id: 1 },
      optionB: { text: "Custom Apply", id: 2 }
    },
    {
      situation: "Job with empty options",
      job_title: "Product Manager",
      company_name: "BizInc",
      location: "New York, NY",
      salary: "$60,000 - $80,000",
      company_rating: 4.2,
      optionA: { text: "", id: 3 },
      optionB: { text: "", id: 4 }
    },
    {
      situation: "Job with null options",
      job_title: "Designer",
      company_name: "CreativeStudio",
      location: "San Francisco, CA",
      salary: undefined,
      company_rating: 3.9,
      optionA: { text: null as any, id: 5 },
      optionB: { text: null as any, id: 6 }
    }
  ];

  return testScenarios.map(ensureDefaultOptions);
} 