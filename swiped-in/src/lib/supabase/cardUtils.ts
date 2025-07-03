import { supabase } from './client'

// Type for jobs from the database
export type Job = {
  jobid: number
  title: string
  company: string
  location: string
  description_text: string
}

// Type for the game's scenario format
export type ClientScenario = {
  situation: string
  optionA: { text: string; id: number }
  optionB: { text: string; id: number }
}

// Load all jobs from the database
export async function loadJobsFromDatabase(): Promise<Job[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('*')

    if (error) {
      console.error('Error loading jobs from database:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to load jobs from database:', error)
    return []
  }
}

// Transform database jobs into game scenarios
export function transformJobsToScenarios(jobs: Job[]): ClientScenario[] {
  return jobs.map((job) => {
    // Create the situation text using job details
    const situation = `${job.title} at ${job.company} (${job.location})`
    
    // Use the description to create more context
    const fullSituation = job.description_text 
      ? `${situation} - ${job.description_text}`
      : situation

    // Default choices for job scenarios
    const optionA = { text: 'Decline', id: job.jobid }
    const optionB = { text: 'Accept', id: job.jobid }

    return {
      situation: fullSituation,
      optionA,
      optionB,
    }
  })
}

// Load and transform jobs for the game
export async function loadGameScenarios(): Promise<ClientScenario[]> {
  try {
    const jobs = await loadJobsFromDatabase()
    return transformJobsToScenarios(jobs)
  } catch (error) {
    console.error('Failed to load game scenarios:', error)
    return []
  }
}

// Create a new job in the database
export async function createJob(jobData: {
  title: string
  company: string
  location: string
  description_text: string
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