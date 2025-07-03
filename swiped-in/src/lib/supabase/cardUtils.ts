import { supabase } from './client'
import type { Database } from './database.types'

// Type for cards from the database
export type Card = Database['public']['Tables']['cards']['Row']

// Type for the game's scenario format
export type ClientScenario = {
  situation: string
  optionA: { text: string; id: number }
  optionB: { text: string; id: number }
}

// Load all cards from the database
export async function loadCardsFromDatabase(): Promise<Card[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading cards from database:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to load cards from database:', error)
    return []
  }
}

// Transform database cards into game scenarios
export function transformCardsToScenarios(cards: Card[]): ClientScenario[] {
  return cards.map((card) => {
    // Extract content from the card
    const content = card.content as any
    const choices = card.choices as any
    
    // Create the situation text
    let situation = 'Unknown scenario'
    if (content && typeof content === 'object') {
      if (content.text) {
        situation = content.text
      } else if (content.situation) {
        situation = content.situation
      } else if (content.title) {
        situation = content.title
      }
    } else if (typeof content === 'string') {
      situation = content
    }

    // Extract choices
    let optionA = { text: 'Decline', id: card.id }
    let optionB = { text: 'Accept', id: card.id }

    if (choices && Array.isArray(choices) && choices.length >= 2) {
      optionA = { text: choices[0]?.text || 'Option A', id: card.id }
      optionB = { text: choices[1]?.text || 'Option B', id: card.id }
    } else if (card.leading_choice) {
      // If there's a leading choice, use it as one option
      optionA = { text: card.leading_choice, id: card.id }
      optionB = { text: 'Alternative', id: card.id }
    }

    return {
      situation,
      optionA,
      optionB,
    }
  })
}

// Load and transform cards for the game
export async function loadGameScenarios(): Promise<ClientScenario[]> {
  try {
    const cards = await loadCardsFromDatabase()
    return transformCardsToScenarios(cards)
  } catch (error) {
    console.error('Failed to load game scenarios:', error)
    return []
  }
}

// Create a new card in the database
export async function createCard(cardData: {
  content: any
  choices?: any
  leading_choice?: string | null
  parent?: number | null
}): Promise<Card | null> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .insert([cardData])
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to create card:', error)
    return null
  }
}

// Update a card in the database
export async function updateCard(id: number, updates: Partial<Card>): Promise<Card | null> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to update card:', error)
    return null
  }
}

// Delete a card from the database
export async function deleteCard(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting card:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Failed to delete card:', error)
    return false
  }
} 