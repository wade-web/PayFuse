export class VoiceService {
  private static instance: VoiceService
  private elevenLabsApiKey = process.env.VITE_ELEVENLABS_API_KEY
  private recognition: any = null
  private synthesis: SpeechSynthesis

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService()
    }
    return VoiceService.instance
  }

  constructor() {
    this.synthesis = window.speechSynthesis
    
    // Initialiser la reconnaissance vocale si disponible
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'fr-FR'
    }
  }

  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Reconnaissance vocale non supportée'))
        return
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Erreur reconnaissance vocale: ${event.error}`))
      }

      this.recognition.start()
    })
  }

  async speak(text: string): Promise<void> {
    try {
      // Essayer ElevenLabs si la clé API est disponible
      if (this.elevenLabsApiKey) {
        await this.speakWithElevenLabs(text)
      } else {
        // Fallback vers l'API Web Speech
        await this.speakWithWebAPI(text)
      }
    } catch (error) {
      console.error('Erreur synthèse vocale:', error)
      // Fallback vers l'API Web Speech
      await this.speakWithWebAPI(text)
    }
  }

  private async speakWithElevenLabs(text: string): Promise<void> {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.elevenLabsApiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) {
      throw new Error('Erreur ElevenLabs API')
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      }
      audio.onerror = reject
      audio.play()
    })
  }

  private async speakWithWebAPI(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onend = () => resolve()
      utterance.onerror = reject
      
      this.synthesis.speak(utterance)
    })
  }

  processVoiceCommand(command: string): string {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('paiement') && lowerCommand.includes('créer')) {
      return 'Création d\'un nouveau paiement en cours. Veuillez spécifier le montant et le numéro de téléphone.'
    } else if (lowerCommand.includes('statistiques') || lowerCommand.includes('stats')) {
      return 'Affichage de vos statistiques en cours. Redirection vers le tableau de bord analytics.'
    } else if (lowerCommand.includes('rapport')) {
      return 'Génération du rapport en cours. Il sera disponible dans quelques instants.'
    } else if (lowerCommand.includes('webhook')) {
      return 'Vérification du statut des webhooks en cours.'
    } else {
      return 'Commande non reconnue. Essayez: "créer un paiement", "afficher les statistiques", ou "générer un rapport".'
    }
  }
}
