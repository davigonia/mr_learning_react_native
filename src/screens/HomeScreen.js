import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
// Using View instead of SafeAreaView for better compatibility
import ParentModal from '../components/ParentModal';
import { getSpeechRecognition, getSpeechSynthesis } from '../utils/WebSpeech';

// Import Voice and TTS conditionally based on platform
let Voice = null;
let Tts = null;
let webSpeechRecognition = null;
let webSpeechSynthesis = null;

if (Platform.OS === 'web') {
  // For web, we'll use the Web Speech API utilities
  webSpeechRecognition = getSpeechRecognition();
  webSpeechSynthesis = getSpeechSynthesis();
} else {
  // For native platforms, import the libraries
  Voice = require('react-native-voice').default;
  Tts = require('react-native-tts').default;
}

const HomeScreen = () => {
  // State variables
  const [isListening, setIsListening] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Get values from localStorage or set defaults
  const [userPin, setUserPin] = useState('1234');
  const [bannedWords, setBannedWords] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]);
  
  // API key
  const apiKey = 'xai-GIZVljR8NKqZN7VLkXx1H4zTY51VViFLwpeAu1dDCz9BhpRxVPEIGMO5LqH3YVZplkVIlncCW6lqKhbK';

  useEffect(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const storedPin = localStorage.getItem('mrLearningPin');
      const storedBannedWords = localStorage.getItem('mrLearningBannedWords');
      const storedHistory = localStorage.getItem('mrLearningHistory');
      
      if (storedPin) setUserPin(storedPin);
      if (storedBannedWords) setBannedWords(JSON.parse(storedBannedWords));
      if (storedHistory) setQuestionHistory(JSON.parse(storedHistory));
    }
    
    // Initialize voice recognition and TTS based on platform
    initializeVoiceAndTts();
    
    return () => {
      // Cleanup
      if (Platform.OS !== 'web' && Voice) {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);
  
  // Initialize voice recognition and TTS
  const initializeVoiceAndTts = () => {
    if (Platform.OS === 'web') {
      // Web implementation using WebSpeech utilities
      if (webSpeechRecognition) {
        webSpeechRecognition.setOnStart(() => {
          setIsListening(true);
        });
        
        webSpeechRecognition.setOnEnd(() => {
          setIsListening(false);
        });
        
        webSpeechRecognition.setOnResult((transcript) => {
          handleSpeechResult(transcript);
        });
        
        webSpeechRecognition.setOnError((error) => {
          setIsListening(false);
          
          if (error === 'not-allowed' || error === 'permission-denied') {
            setFeedbackText("Please allow microphone access to use voice input.");
          } else if (error === 'no-speech') {
            setFeedbackText("No speech detected. Please try again.");
          } else if (error === 'audio-capture') {
            setFeedbackText("No microphone detected. Please connect a microphone.");
          } else if (error === 'network') {
            setFeedbackText("Network error. Please check your connection.");
          } else {
            setFeedbackText("Couldn't hear you, try again!");
          }
        });
      }
    } else if (Voice && Tts) {
      // Native implementation
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
          const transcript = e.value[0];
          handleSpeechResult(transcript);
        }
      };
      Voice.onSpeechError = (e) => {
        setIsListening(false);
        setFeedbackText("Speech recognition error. Please try again.");
      };
      
      // Initialize TTS
      Tts.setDefaultLanguage('zh-HK');
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.2);
    }
  };
  
  // Handle speech result
  const handleSpeechResult = (transcript) => {
    // Check for banned words
    if (containsBannedWord(transcript)) {
      setFeedbackText('');
      setAnswerText("Sorry, that's not a good question!");
      speakText("Sorry, that's not a good question!");
      return;
    }
    
    // Process the question
    processQuestion(transcript);
  };
  
  // Check if transcript contains banned words
  const containsBannedWord = (transcript) => {
    const lowerTranscript = transcript.toLowerCase();
    return bannedWords.some(word => lowerTranscript.includes(word.toLowerCase()));
  };
  
  // Process the question
  const processQuestion = async (question) => {
    setFeedbackText('');
    setIsLoading(true);
    setFeedbackText('Asking Mr. Learning...');
    
    try {
      // Add to history
      const timestamp = new Date().toLocaleString();
      const historyItem = { timestamp, question, answer: '' };
      
      // Call Grok API
      const response = await callGrokAPI(question);
      
      // Update history with answer
      historyItem.answer = response;
      addToHistory(historyItem);
      
      // Display and speak the answer
      setIsLoading(false);
      setFeedbackText('');
      setAnswerText(response);
      speakText(response);
    } catch (error) {
      console.error('Error processing question:', error);
      setIsLoading(false);
      setFeedbackText('');
      setAnswerText('Mr. Learning is resting, try again!');
      speakText('Mr. Learning is resting, try again!');
    }
  };
  
  // Call Grok API
  const callGrokAPI = async (question) => {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-3',
          max_tokens: 150,
          messages: [
            {
              "role": "system", 
              "content": "You are Mr. Learning, an educational assistant for children aged 5+. Respond in Cantonese with these guidelines:\n1. Be intellectual and accurate - do not oversimplify concepts\n2. Use simple, clear wording that children can understand\n3. Keep answers concise, precise and to the point (maximum 3-4 sentences)\n4. Avoid personal notes, opinions or unrelated thoughts\n5. Be creative with explanations when needed\n6. Focus purely on delivering factual, educational content\n7. Do not use phrases like 'As Mr. Learning' or refer to yourself\n8. Respond directly to the question without preamble"
            },
            {
              "role": "user", 
              "content": question
            }
          ],
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Grok API error:', error);
      
      // Fallback responses
      const fallbackResponses = [
        "你好！我是學習先生。我很高興回答你的問題。",
        "地球是圓的，就像一個大球。它繞著太陽轉動。",
        "恐龍是很久以前生活在地球上的大動物。牠們已經滅絕了。",
        "彩虹是因為陽光通過雨滴而形成的。它有七種顏色。",
        "星星是在太空中的大火球，就像我們的太陽一樣。"
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };
  
  // Speak text
  const speakText = (text) => {
    if (Platform.OS === 'web') {
      // Web implementation using WebSpeech utilities
      if (webSpeechSynthesis) {
        const success = webSpeechSynthesis.speak(text);
        if (!success) {
          console.warn('Speech synthesis not available or failed');
          // Show a message that Cantonese voice is not available
          const originalAnswer = answerText;
          setAnswerText('Cantonese voice not supported on this device');
          
          // Restore original answer after 3 seconds
          setTimeout(() => {
            setAnswerText(originalAnswer);
          }, 3000);
        }
      }
    } else if (Tts) {
      Tts.stop();
      Tts.speak(text);
    }
  };
  
  // Add to history
  const addToHistory = (item) => {
    const updatedHistory = [item, ...questionHistory];
    if (updatedHistory.length > 50) updatedHistory.pop();
    setQuestionHistory(updatedHistory);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mrLearningHistory', JSON.stringify(updatedHistory));
    }
  };
  
  // Start listening
  const startListening = async () => {
    setAnswerText('');
    
    if (Platform.OS === 'web') {
      // Web implementation using WebSpeech utilities
      if (webSpeechRecognition) {
        if (!webSpeechRecognition.isAvailable()) {
          setFeedbackText("Your browser doesn't support voice recognition.");
          return;
        }
        
        try {
          // Request permission first
          await webSpeechRecognition.requestPermission();
          
          // Start recognition
          const started = webSpeechRecognition.start();
          if (!started) {
            setFeedbackText("Couldn't start listening. Please try again.");
          } else {
            setFeedbackText("Listening...");
          }
        } catch (error) {
          console.error('Error starting web speech recognition:', error);
          setFeedbackText("Please allow microphone access to use voice input.");
        }
      }
    } else if (Voice) {
      try {
        await Voice.start('yue-Hant-HK');
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setFeedbackText("Couldn't start listening. Please try again.");
      }
    }
  };
  
  // Stop listening
  const stopListening = async () => {
    if (Platform.OS === 'web') {
      // Web implementation using WebSpeech utilities
      if (webSpeechRecognition) {
        webSpeechRecognition.stop();
      }
    } else if (Voice) {
      try {
        await Voice.stop();
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }
  };
  
  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.background} />
      
      <Text style={styles.title}>Mr. Learning</Text>
      
      <Text style={styles.credit}>
        Made with love by David Cheang{' '}
        <Text style={styles.creditLink}>@dadnotehk</Text>
      </Text>
      
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.askButton, isListening && styles.listeningButton]}
          onPress={toggleListening}
        >
          <Text style={styles.askButtonIcon}>
            {Platform.OS === 'web' ? (
              <i className={`fas fa-microphone ${isListening ? 'pulsing' : ''}`} style={{fontSize: 36, color: 'white'}} />
            ) : (
              '🎤'
            )}
          </Text>
          <Text style={styles.askButtonText}>Ask Me Anything</Text>
        </TouchableOpacity>
        
        {feedbackText ? (
          <Text style={styles.feedbackText}>{feedbackText}</Text>
        ) : null}
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF2E63" style={styles.spinner} />
        ) : null}
        
        {answerText ? (
          <Text style={styles.answerText}>{answerText}</Text>
        ) : null}
        
        <View style={styles.parentAccessContainer}>
          <TouchableOpacity
            style={styles.parentAccessButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.parentAccessButtonText}>Parent Access</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ParentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userPin={userPin}
        setUserPin={setUserPin}
        bannedWords={bannedWords}
        setBannedWords={setBannedWords}
        questionHistory={questionHistory}
        setQuestionHistory={setQuestionHistory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #BEE3F8 0%, #FED7E2 50%, #C7D2FE 100%)',
    })
  },
  },
  title: {
    fontFamily: 'Baloo 2, cursive',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    color: '#7F7FD5',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  credit: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Nunito, sans-serif',
  },
  creditLink: {
    color: '#FF2E63',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 800,
    padding: 32,
  },
  askButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#00D084',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  listeningButton: {
    backgroundColor: '#FF2E63',
  },
  askButtonIcon: {
    color: 'white',
    fontSize: 36,
    marginBottom: 12,
  },
  pulsing: {
    // This will be handled by CSS animations in web
  },
  askButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 24,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 24,
  },
  answerText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#2D3748',
    marginTop: 24,
    textAlign: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  parentAccessContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  parentAccessButton: {
    backgroundColor: '#D6BCFA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  parentAccessButtonText: {
    color: '#2D3748',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
