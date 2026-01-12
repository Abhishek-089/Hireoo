import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class EmbeddingsService {
  private static readonly MODEL = 'text-embedding-3-small'
  private static readonly MAX_TOKENS = 8000 // Token limit for the model

  /**
   * Create embeddings for job text
   */
  static async createJobEmbedding(jobText: string): Promise<number[]> {
    try {
      // Prepare job text for embedding
      const processedText = this.prepareJobText(jobText)

      const response = await openai.embeddings.create({
        model: this.MODEL,
        input: processedText,
        encoding_format: 'float',
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Error creating job embedding:', error)
      throw new Error('Failed to create job embedding')
    }
  }

  /**
   * Create embeddings for user profile
   */
  static async createUserProfileEmbedding(userProfile: {
    skills: string[]
    experience: string
    currentRole?: string
    preferredJobTitles?: string[]
  }): Promise<number[]> {
    try {
      // Prepare user profile text for embedding
      const processedText = this.prepareUserProfileText(userProfile)

      const response = await openai.embeddings.create({
        model: this.MODEL,
        input: processedText,
        encoding_format: 'float',
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Error creating user profile embedding:', error)
      throw new Error('Failed to create user profile embedding')
    }
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  static calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embedding vectors must have the same length')
    }

    let dotProduct = 0
    let magnitude1 = 0
    let magnitude2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      magnitude1 += embedding1[i] * embedding1[i]
      magnitude2 += embedding2[i] * embedding2[i]
    }

    magnitude1 = Math.sqrt(magnitude1)
    magnitude2 = Math.sqrt(magnitude2)

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0
    }

    return dotProduct / (magnitude1 * magnitude2)
  }

  /**
   * Prepare job text for embedding
   */
  private static prepareJobText(jobText: string): string {
    // Clean and prepare job text for embedding
    let processed = jobText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Truncate if too long (leave some buffer for tokenization)
    if (processed.length > this.MAX_TOKENS * 4) { // Rough character to token ratio
      processed = processed.substring(0, this.MAX_TOKENS * 4) + '...'
    }

    return processed
  }

  /**
   * Prepare user profile text for embedding
   */
  private static prepareUserProfileText(profile: {
    skills: string[]
    experience: string
    currentRole?: string
    preferredJobTitles?: string[]
  }): string {
    const parts = []

    // Add current role
    if (profile.currentRole) {
      parts.push(`Current role: ${profile.currentRole}`)
    }

    // Add skills
    if (profile.skills.length > 0) {
      parts.push(`Skills: ${profile.skills.join(', ')}`)
    }

    // Add experience
    if (profile.experience) {
      parts.push(`Experience: ${profile.experience}`)
    }

    // Add preferred job titles
    if (profile.preferredJobTitles && profile.preferredJobTitles.length > 0) {
      parts.push(`Looking for: ${profile.preferredJobTitles.join(', ')}`)
    }

    const combinedText = parts.join('. ')
    return this.prepareJobText(combinedText)
  }

  /**
   * Batch create embeddings for multiple texts
   */
  static async createBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // Prepare all texts
      const processedTexts = texts.map(text => this.prepareJobText(text))

      const response = await openai.embeddings.create({
        model: this.MODEL,
        input: processedTexts,
        encoding_format: 'float',
      })

      return response.data.map(item => item.embedding)
    } catch (error) {
      console.error('Error creating batch embeddings:', error)
      throw new Error('Failed to create batch embeddings')
    }
  }
}


