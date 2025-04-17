import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform
} from 'react-native';

const ParentModal = ({
  visible,
  onClose,
  userPin,
  setUserPin,
  bannedWords,
  setBannedWords,
  questionHistory,
  setQuestionHistory
}) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [showPinError, setShowPinError] = useState(false);
  const [newBannedWord, setNewBannedWord] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinChangeError, setShowPinChangeError] = useState(false);
  const [pinChangeErrorText, setPinChangeErrorText] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  
  // Create refs for PIN input fields
  const pinInputRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null)
  ];

  // Handle PIN input change
  const handlePinDigitChange = (text, index) => {
    if (text.length <= 1 && /^\d*$/.test(text)) {
      const newPinDigits = [...pinDigits];
      newPinDigits[index] = text;
      setPinDigits(newPinDigits);
      
      // Auto-focus next input
      if (text.length === 1 && index < 3) {
        if (pinInputRefs[index + 1] && pinInputRefs[index + 1].current) {
          pinInputRefs[index + 1].current.focus();
        }
      }
    }
  };

  // Submit PIN
  const handleSubmitPin = () => {
    const enteredPin = pinDigits.join('');
    
    if (enteredPin === userPin) {
      setShowPinError(false);
      setShowDashboard(true);
    } else {
      setShowPinError(true);
      setPinDigits(['', '', '', '']);
    }
  };

  // Add banned word
  const handleAddBannedWord = () => {
    const word = newBannedWord.trim();
    
    if (word && !bannedWords.includes(word)) {
      const updatedBannedWords = [...bannedWords, word];
      setBannedWords(updatedBannedWords);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mrLearningBannedWords', JSON.stringify(updatedBannedWords));
      }
      
      setNewBannedWord('');
    }
  };

  // Remove banned word
  const handleRemoveBannedWord = (index) => {
    const updatedBannedWords = [...bannedWords];
    updatedBannedWords.splice(index, 1);
    setBannedWords(updatedBannedWords);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mrLearningBannedWords', JSON.stringify(updatedBannedWords));
    }
  };

  // Change PIN
  const handleChangePin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin) || newPin !== confirmPin) {
      setShowPinChangeError(true);
      setPinChangeErrorText("PINs don't match or not 4 digits!");
      setPinChangeSuccess(false);
      return;
    }
    
    setUserPin(newPin);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mrLearningPin', newPin);
    }
    
    setShowPinChangeError(true);
    setPinChangeErrorText('PIN updated successfully!');
    setPinChangeSuccess(true);
    setNewPin('');
    setConfirmPin('');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowPinChangeError(false);
    }, 3000);
  };

  // Clear history
  const handleClearHistory = () => {
    setQuestionHistory([]);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mrLearningHistory', JSON.stringify([]));
    }
  };

  // Close modal
  const handleClose = () => {
    setShowDashboard(false);
    setPinDigits(['', '', '', '']);
    setShowPinError(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {!showDashboard ? (
            // PIN Screen
            <View style={styles.pinScreen}>
              <Text style={styles.modalTitle}>Parent Access</Text>
              <Text style={styles.modalSubtitle}>Enter 4-digit PIN</Text>
              
              <View style={styles.pinInputContainer}>
                {pinDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={pinInputRefs[index]}
                    style={styles.pinDigitInput}
                    value={digit}
                    onChangeText={(text) => handlePinDigitChange(text, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    secureTextEntry={true}
                    onKeyPress={({ nativeEvent }) => {
                      // Handle backspace to focus previous input
                      if (nativeEvent.key === 'Backspace' && digit === '' && index > 0) {
                        if (pinInputRefs[index - 1] && pinInputRefs[index - 1].current) {
                          pinInputRefs[index - 1].current.focus();
                        }
                      }
                    }}
                  />
                ))}
              </View>
              
              {showPinError && (
                <Text style={styles.errorText}>Wrong PIN, try again!</Text>
              )}
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitPin}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Dashboard
            <ScrollView style={styles.dashboard}>
              <Text style={styles.modalTitle}>Parent Dashboard</Text>
              
              {/* Banned Words Section */}
              <View style={styles.dashboardSection}>
                <Text style={styles.sectionTitle}>Banned Words</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    value={newBannedWord}
                    onChangeText={setNewBannedWord}
                    placeholder="Add new word"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddBannedWord}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.wordsList}>
                  {bannedWords.length > 0 ? (
                    bannedWords.map((word, index) => (
                      <View key={index} style={styles.wordItem}>
                        <Text style={styles.wordText}>{word}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveBannedWord(index)}
                        >
                          <Text style={styles.removeWordButton}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyListText}>No banned words</Text>
                  )}
                </View>
              </View>
              
              {/* Change PIN Section */}
              <View style={styles.dashboardSection}>
                <Text style={styles.sectionTitle}>Change PIN</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholder="New 4-digit PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={true}
                />
                <TextInput
                  style={[styles.textInput, { marginTop: 8 }]}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Confirm PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={true}
                />
                
                {showPinChangeError && (
                  <Text style={[
                    styles.errorText,
                    pinChangeSuccess && styles.successText
                  ]}>
                    {pinChangeErrorText}
                  </Text>
                )}
                
                <TouchableOpacity
                  style={[styles.submitButton, { marginTop: 8 }]}
                  onPress={handleChangePin}
                >
                  <Text style={styles.submitButtonText}>Update PIN</Text>
                </TouchableOpacity>
              </View>
              
              {/* History Section */}
              <View style={styles.dashboardSection}>
                <Text style={styles.sectionTitle}>Question History</Text>
                <ScrollView style={styles.historyList}>
                  {questionHistory.length > 0 ? (
                    questionHistory.map((item, index) => (
                      <View key={index} style={styles.historyItem}>
                        <Text style={styles.historyTimestamp}>{item.timestamp}</Text>
                        <Text style={styles.historyQuestion}>Q: {item.question}</Text>
                        <Text style={styles.historyAnswer}>A: {item.answer}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyListText}>No history yet</Text>
                  )}
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClearHistory}
                >
                  <Text style={styles.cancelButtonText}>Clear History</Text>
                </TouchableOpacity>
              </View>
              
              {/* Exit Section */}
              <View style={styles.dashboardSection}>
                <TouchableOpacity
                  style={styles.exitButton}
                  onPress={handleClose}
                >
                  <Text style={styles.exitButtonText}>Exit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 450,
    maxHeight: '90%',
  },
  pinScreen: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins, sans-serif',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    fontFamily: 'Nunito, sans-serif',
    textAlign: 'center',
    marginBottom: 8,
  },
  pinInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  pinDigitInput: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 8,
  },
  errorText: {
    color: '#E53E3E',
    fontFamily: 'Nunito, sans-serif',
    fontSize: 14,
    marginTop: 8,
  },
  successText: {
    color: '#38A169',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#38A169',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  submitButtonText: {
    color: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FEB2B2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButtonText: {
    color: '#4A5568',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: '600',
  },
  dashboard: {
    maxHeight: '100%',
  },
  dashboardSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dashboardSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins, sans-serif',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 8,
    fontFamily: 'Nunito, sans-serif',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#38A169',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: '600',
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  wordItem: {
    backgroundColor: '#FEB2B2',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordText: {
    color: '#742A2A',
    fontFamily: 'Nunito, sans-serif',
    fontSize: 14,
  },
  removeWordButton: {
    color: '#742A2A',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  emptyListText: {
    color: '#718096',
    fontFamily: 'Nunito, sans-serif',
    fontSize: 14,
  },
  historyList: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  historyItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#718096',
  },
  historyQuestion: {
    fontWeight: '600',
    marginVertical: 4,
  },
  historyAnswer: {
    color: '#4A5568',
  },
  exitButton: {
    backgroundColor: '#D6BCFA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#4A5568',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ParentModal;
