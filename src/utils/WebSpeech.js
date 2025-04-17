// Web Speech API utilities for React Native Web

// Speech Recognition
export class WebSpeechRecognition {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.callbacks = {
      onStart: null,
      onEnd: null,
      onResult: null,
      onError: null
    };
    
    this.initialize();
  }
  
  initialize() {
    if (typeof window !== 'undefined') {
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (window.SpeechRecognition) {
        this.recognition = new window.SpeechRecognition();
        this.recognition.lang = 'yue-Hant-HK'; // Cantonese
        this.recognition.interimResults = true; // Enable interim results to detect pauses
        this.recognition.maxAlternatives = 1;
        this.recognition.continuous = false;
        // Add a short timeout for automatic end detection
        this.silenceTimeout = null;
        this.finalTranscript = '';
        
        this.recognition.onstart = () => {
          this.isListening = true;
          if (this.callbacks.onStart) this.callbacks.onStart();
        };
        
        this.recognition.onend = () => {
          this.isListening = false;
          if (this.callbacks.onEnd) this.callbacks.onEnd();
        };
        
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = this.finalTranscript;
          
          // Process the results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          this.finalTranscript = finalTranscript;
          
          // If we have interim results, set a timeout to automatically end
          // recognition if there's a pause in speech
          if (interimTranscript !== '') {
            // Clear any existing timeout
            if (this.silenceTimeout) {
              clearTimeout(this.silenceTimeout);
            }
            
            // Set a new timeout - if no new speech is detected in 1.5 seconds,
            // consider it done and stop listening
            this.silenceTimeout = setTimeout(() => {
              if (this.isListening) {
                this.stop();
                
                // Only call onResult with the final transcript if we have one
                if (this.finalTranscript && this.callbacks.onResult) {
                  this.callbacks.onResult(this.finalTranscript);
                }
              }
            }, 1500);
          }
        };
        
        this.recognition.onerror = (event) => {
          this.isListening = false;
          if (this.callbacks.onError) this.callbacks.onError(event.error);
        };
      }
    }
  }
  
  setOnStart(callback) {
    this.callbacks.onStart = callback;
  }
  
  setOnEnd(callback) {
    this.callbacks.onEnd = callback;
  }
  
  setOnResult(callback) {
    this.callbacks.onResult = callback;
  }
  
  setOnError(callback) {
    this.callbacks.onError = callback;
  }
  
  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        return false;
      }
    }
    return false;
  }
  
  stop() {
    if (this.recognition && this.isListening) {
      try {
        // Clear any pending silence timeout
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }
        
        // Reset the transcript for next session
        const transcript = this.finalTranscript;
        this.finalTranscript = '';
        
        // Stop the recognition
        this.recognition.stop();
        
        return true;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        return false;
      }
    }
    return false;
  }
  
  isAvailable() {
    return typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  
  requestPermission() {
    return new Promise((resolve, reject) => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            // Keep the stream active to maintain permission
            window.audioStream = stream;
            resolve(true);
          })
          .catch(err => {
            console.error('Microphone permission denied:', err);
            reject(err);
          });
      } else {
        reject(new Error('Media devices API not available'));
      }
    });
  }
}

// Speech Synthesis
export class WebSpeechSynthesis {
  constructor() {
    this.synthesis = null;
    this.voices = [];
    
    this.initialize();
  }
  
  initialize() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Chrome needs this event to get voices
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
      }
    }
  }
  
  loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
      console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
    }
  }
  
  getBestVoice() {
    if (!this.voices.length) {
      this.loadVoices();
    }
    
    // Priority 1: Google Hong Kong voice
    let googleHKVoice = this.voices.find(voice => 
      voice.name.includes('Google') && 
      (voice.lang === 'zh-HK' || voice.lang === 'yue-Hant-HK')
    );
    
    // Priority 2: Any voice with 粵 in the name
    let cantoneseNameVoice = this.voices.find(voice => 
      voice.name.includes('粵')
    );
    
    // Priority 3: Any zh-HK voice
    let zhHKVoice = this.voices.find(voice => 
      voice.lang === 'zh-HK'
    );
    
    // Priority 4: Any Cantonese voice
    let cantoneseVoice = this.voices.find(voice => 
      voice.lang === 'yue-Hant-HK' || 
      voice.lang.includes('yue')
    );
    
    // Priority 5: Any Chinese voice
    let chineseVoice = this.voices.find(voice => 
      voice.lang.includes('zh')
    );
    
    // Return the best voice found based on priority
    return googleHKVoice || cantoneseNameVoice || zhHKVoice || cantoneseVoice || chineseVoice || null;
  }
  
  speak(text) {
    if (this.synthesis) {
      // Cancel any ongoing speech
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-HK'; // Hong Kong Cantonese
      utterance.pitch = 1.2;
      utterance.rate = 0.95;
      
      // Get the best voice
      const bestVoice = this.getBestVoice();
      if (bestVoice) {
        console.log('Using voice:', bestVoice.name);
        utterance.voice = bestVoice;
      } else {
        console.warn('No suitable Cantonese voice found, using default voice');
      }
      
      this.synthesis.speak(utterance);
      return true;
    }
    return false;
  }
  
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      return true;
    }
    return false;
  }
  
  isAvailable() {
    return typeof window !== 'undefined' && window.speechSynthesis;
  }
}

// Create singleton instances
let webSpeechRecognition = null;
let webSpeechSynthesis = null;

// Get speech recognition instance
export const getSpeechRecognition = () => {
  if (!webSpeechRecognition) {
    webSpeechRecognition = new WebSpeechRecognition();
  }
  return webSpeechRecognition;
};

// Get speech synthesis instance
export const getSpeechSynthesis = () => {
  if (!webSpeechSynthesis) {
    webSpeechSynthesis = new WebSpeechSynthesis();
  }
  return webSpeechSynthesis;
};
