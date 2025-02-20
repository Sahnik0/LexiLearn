import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, Award, Brain, CheckCircle, XCircle, RefreshCw, 
  PlayCircle, PauseCircle, Volume2, Star, Trophy, Timer,
  Sparkles, ChevronRight, ArrowRight
} from 'lucide-react';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';

const modules = [
  {
    title: "Understanding Phonological Awareness",
    content: `
      Phonological awareness is the foundation of reading and writing. It involves:
      • Recognizing and working with sounds in spoken words
      • Understanding that words are made up of speech sounds (phonemes)
      • Identifying and manipulating these sounds
      
      Key Skills:
      1. Rhyming
      2. Syllable counting
      3. Sound blending
      4. Sound segmentation

      Practice Exercise:
      Try breaking these words into sounds:
      • "cat" = /k/ /æ/ /t/
      • "ship" = /ʃ/ /ɪ/ /p/
      • "train" = /t/ /r/ /eɪ/ /n/
    `,
    quiz: [
      {
        question: "What sound do 'cat' and 'hat' share?",
        options: ["Beginning sound", "Middle sound", "Ending sound", "None"],
        correct: 2,
        explanation: "Both words share the ending sound pattern '-at', making them rhyming words."
      },
      {
        question: "How many syllables are in the word 'butterfly'?",
        options: ["Two", "Three", "Four", "One"],
        correct: 1,
        explanation: "The word 'butterfly' has three syllables: but-ter-fly"
      },
      {
        question: "Which word begins with the same sound as 'ship'?",
        options: ["chip", "fish", "thin", "kite"],
        correct: 0,
        explanation: "Both 'ship' and 'chip' begin with the 'sh' sound (/ʃ/)"
      }
    ]
  },
  {
    title: "Advanced Reading Strategies",
    content: `
      Advanced reading strategies help improve comprehension and speed:
      • Contextual analysis
      • Word pattern recognition
      • Visualization techniques
      • Active reading methods

      Key Techniques:
      1. Breaking words into familiar patterns
      2. Using context clues
      3. Making mental images
      4. Predicting content
    `,
    quiz: [
      {
        question: "What is the best strategy for unfamiliar words?",
        options: ["Skip them", "Sound out patterns", "Ask immediately", "Give up"],
        correct: 1,
        explanation: "Breaking words into familiar patterns helps decode new words effectively."
      },
      {
        question: "How does visualization help reading?",
        options: ["Improves memory", "Wastes time", "Slows reading", "No effect"],
        correct: 0,
        explanation: "Creating mental images helps connect text to memory and improves comprehension."
      }
    ]
  }
];

function Learning() {
  const { currentUser } = useAuth();
  const [activeModule, setActiveModule] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [userProgress, setUserProgress] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const progressRef = ref(database, `progress/${currentUser.uid}`);
      get(progressRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUserProgress(snapshot.val());
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const saveProgress = async () => {
    if (currentUser) {
      const progressRef = ref(database, `progress/${currentUser.uid}`);
      const updatedProgress = {
        ...userProgress,
        [activeModule]: {
          completed: true,
          score: quizScore,
          timeSpent: timer
        }
      };
      await set(progressRef, updatedProgress);
      setUserProgress(updatedProgress);
    }
  };

  const handleQuizSubmit = () => {
    let score = 0;
    const currentQuiz = modules[activeModule].quiz;
    
    currentQuiz.forEach((question, index) => {
      if (userAnswers[index] === question.correct) {
        score++;
      }
    });

    const finalScore = (score / currentQuiz.length) * 100;
    setQuizScore(finalScore);
    setIsTimerRunning(false);
    saveProgress();
  };

  const resetQuiz = () => {
    setQuizScore(null);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowQuiz(false);
    setTimer(0);
    setIsTimerRunning(false);
    setShowExplanation(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBackgroundEffects = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400/10 blur-xl"
          style={{
            width: Math.random() * 200 + 100 + "px",
            height: Math.random() * 200 + 100 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            transform: `translate(-50%, -50%) translateY(${scrollY * (Math.random() * 0.2)}px)`,
            transition: "transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)",
            animation: `float ${Math.random() * 7 + 10}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {renderBackgroundEffects()}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-300% animate-gradient">
              Interactive Learning
            </span>
          </h1>
          <p className="text-xl text-white/80">
            Master key concepts through interactive lessons and quizzes
          </p>
        </div>

        {/* Module Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {modules.map((module, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveModule(index);
                resetQuiz();
              }}
              className={`px-6 py-3 rounded-lg flex items-center backdrop-blur-lg transition-all duration-300 ${
                activeModule === index
                  ? 'bg-blue-600/20 border border-blue-500/50 text-white scale-105'
                  : 'bg-black/50 border border-white/10 text-white/80 hover:border-white/30 hover:scale-105'
              }`}
            >
              {userProgress[index]?.completed && (
                <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
              )}
              Module {index + 1}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/10">
            <Timer className="h-5 w-5 text-blue-400" />
            <span className="font-mono text-white/80">{formatTime(timer)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isTimerRunning ? (
                <PauseCircle className="h-5 w-5" />
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-xl p-8 mb-8">
          {!showQuiz ? (
            // Module Content
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    {modules[activeModule].title}
                  </h2>
                </div>
              </div>
              
              <div className="prose max-w-none text-white/80">
                {modules[activeModule].content.split('\n').map((line, index) => (
                  <p key={index} className="mb-4">
                    {line}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowQuiz(true);
                    setIsTimerRunning(true);
                  }}
                  className="group relative px-8 py-4 rounded-full overflow-hidden"
                >
                  <span className="relative z-10 flex items-center text-white font-medium">
                    <Brain className="h-5 w-5 mr-2" />
                    Start Quiz
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-blue-500/30 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                </button>
              </div>
            </div>
          ) : (
            // Quiz Section
            <div>
              {quizScore === null ? (
                // Quiz Questions
                <div>
                  <div className="flex items-center mb-6">
                    <Award className="h-8 w-8 text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold">Module Quiz</h2>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">
                      Question {currentQuestion + 1} of {modules[activeModule].quiz.length}
                    </h3>
                    <p className="text-lg mb-6 text-white/80">
                      {modules[activeModule].quiz[currentQuestion].question}
                    </p>
                    
                    <div className="space-y-3">
                      {modules[activeModule].quiz[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setUserAnswers({ ...userAnswers, [currentQuestion]: index });
                            if (currentQuestion < modules[activeModule].quiz.length - 1) {
                              setCurrentQuestion(currentQuestion + 1);
                            } else {
                              handleQuizSubmit();
                            }
                          }}
                          className={`w-full text-left p-4 rounded-lg border backdrop-blur-lg transition-all duration-300 ${
                            userAnswers[currentQuestion] === index
                              ? 'border-blue-500/50 bg-blue-600/20 text-white'
                              : 'border-white/10 hover:border-white/30 text-white/80 hover:bg-blue-900/20'
                          }`}
                        >
                          <span className="flex items-center">
                            {option}
                            <ChevronRight className={`ml-auto h-5 w-5 transition-opacity ${
                              userAnswers[currentQuestion] === index ? 'opacity-100' : 'opacity-0'
                            }`} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Quiz Results
                <div className="text-center">
                  <div className="mb-6">
                    {quizScore >= 70 ? (
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <Sparkles className="h-8 w-8 text-yellow-400 ml-2 animate-pulse" />
                      </div>
                    ) : (
                      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    Quiz Complete! Score: {quizScore.toFixed(1)}%
                  </h2>
                  
                  <div className="mb-8">
                    <p className="text-white/80 mb-4">
                      {quizScore >= 70
                        ? "Excellent work! You've mastered this module."
                        : "Keep practicing! Review the material and try again."}
                    </p>
                    <p className="text-white/60">
                      Time taken: {formatTime(timer)}
                    </p>
                  </div>

                  <div className="mb-8">
                    <p className="text-white/80 mb-4">
                      {quizScore >= 70
                        ? "Excellent work! You've mastered this module."
                        : "Keep practicing! Review the material and try again."}
                    </p>
                    <p className="text-white/60">
                      Time taken: {formatTime(timer)}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="mb-8 text-blue-400 hover:text-blue-300 transition-colors flex items-center mx-auto"
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${showExplanation ? 'rotate-180' : ''} transition-transform`} />
                    {showExplanation ? "Hide" : "Show"} Explanations
                  </button>

                  {showExplanation && (
                    <div className="mb-8 text-left space-y-4">
                      {modules[activeModule].quiz.map((question, index) => (
                        <div key={index} className="p-4 backdrop-blur-lg bg-black/30 border border-white/10 rounded-lg">
                          <p className="font-semibold mb-2 text-white">{question.question}</p>
                          <p className="text-white/70 mb-2">
                            Your answer: {question.options[userAnswers[index]]}
                          </p>
                          <p className="text-white/70">
                            Explanation: {question.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetQuiz}
                      className="group relative px-6 py-3 rounded-full overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center text-white font-medium">
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Try Again
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-blue-500/30 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    </button>

                    <button
                      onClick={() => {
                        resetQuiz();
                        setActiveModule((activeModule + 1) % modules.length);
                      }}
                      className="group relative px-6 py-3 rounded-full overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center text-white font-medium">
                        Next Module
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-white/10 transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-white/5 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Tracking */}
        {currentUser && (
          <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-white">Your Learning Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.map((_, index) => (
                <div key={index} className="backdrop-blur-lg bg-black/30 border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Module {index + 1}</span>
                    <div className="flex items-center">
                      {userProgress[index]?.completed && (
                        <div className="flex items-center mr-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-white/80">{userProgress[index].score}%</span>
                        </div>
                      )}
                      <span className="text-blue-400">
                        {userProgress[index]?.completed ? '100%' : index === activeModule ? '50%' : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${userProgress[index]?.completed ? 100 : index === activeModule ? 50 : 0}%`,
                      }}
                    ></div>
                  </div>
                  {userProgress[index]?.timeSpent && (
                    <p className="text-sm text-white/60 mt-2">
                      Time: {formatTime(userProgress[index].timeSpent)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Learning;