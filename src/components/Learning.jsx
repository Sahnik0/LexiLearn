import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, Award, Brain, CheckCircle, XCircle, RefreshCw, 
  PlayCircle, PauseCircle, Volume2, Star, Trophy, Timer,
  Sparkles, ChevronRight, ArrowRight, Headphones,
  Settings, Book, AlertCircle, BarChart, Users,
  Pencil, FileText, Music, Calendar
} from 'lucide-react';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';
import '../styles/fonts.css';

const modules = [
  {
    id: 1,
    title: "Phonological Awareness Fundamentals",
    difficulty: "beginner",
    prerequisites: [],
    estimatedTime: "30 minutes",
    content: `
      Start your reading journey by understanding sounds in words:
      
      1. Word Sounds
      • Listen to each word
      • Break it into individual sounds
      • Practice blending sounds together
      
      Example Words:
      🔊 cat = /k/ /æ/ /t/
      🔊 dog = /d/ /ɒ/ /g/
      🔊 fish = /f/ /ɪ/ /ʃ/
      
      2. Syllable Practice
      • Clap along with each syllable
      • Count syllables in words
      • Combine syllables to form words
      
      Practice Words:
      • but-ter-fly (3 syllables)
      • el-e-phant (3 syllables)
      • hip-po-pot-a-mus (5 syllables)
    `,
    practice: {
      type: "sound-matching",
      exercises: [
        {
          word: "cat",
          sounds: ["k", "æ", "t"],
          audio: "cat.mp3",
          hints: ["Starts like 'car'", "Rhymes with 'hat'"]
        },
        {
          word: "dog",
          sounds: ["d", "ɒ", "g"],
          audio: "dog.mp3",
          hints: ["Starts like 'day'", "Ends like 'bag'"]
        }
      ]
    },
    quiz: [
      {
        question: "How many syllables are in 'butterfly'?",
        audio: "/sound/butterfly.opus",
        options: ["Two", "Three", "Four", "Five"],
        correct: 1,
        explanation: "But-ter-fly has three distinct syllables",
        miniLesson: {
          content: "Let's practice counting syllables. Clap as you say: BUT-TER-FLY",
          audio: "butterfly-lesson.mp3"
        }
      },
      {
        question: "Which word begins with the same sound as 'fish'?",
        options: ["phone", "ship", "thin", "vine"],
        correct: 0,
        explanation: "'Fish' and 'phone' both start with the /f/ sound"
      }
    ]
  },
  {
    id: 2,
    title: "Word Recognition Strategies",
    difficulty: "beginner",
    prerequisites: [1],
    estimatedTime: "45 minutes",
    content: `
      Learn to recognize words quickly and accurately:
      
      1. Sight Words
      • Common words to memorize
      • Quick recognition practice
      • Pattern spotting
      
      Essential Sight Words:
      • the, and, was, you
      • they, said, have, are
      • what, were, when, your
      
      2. Word Patterns
      • Word families (-at, -ig, -op)
      • Common prefixes (un-, re-, pre-)
      • Common suffixes (-ing, -ed, -ly)
    `,
    practice: {
      type: "word-recognition",
      exercises: [
        {
          type: "sight-words",
          words: ["the", "and", "was", "you"],
          timeLimit: 30
        },
        {
          type: "word-patterns",
          patterns: [
            {
              family: "-at",
              words: ["cat", "hat", "rat", "bat"]
            },
            {
              family: "-ig",
              words: ["big", "dig", "pig", "wig"]
            }
          ]
        }
      ]
    },
    quiz: [
      {
        question: "Which words belong to the '-at' word family?",
        options: [
          "cat, hat, mat",
          "big, dig, wig",
          "hop, top, mop",
          "bed, red, fed"
        ],
        correct: 0,
        explanation: "Words ending in '-at' belong to the same word family"
      }
    ]
  },
  {
    id: 3,
    title: "Reading Comprehension Basics",
    difficulty: "intermediate",
    prerequisites: [1, 2],
    estimatedTime: "60 minutes",
    content: `
      Develop your understanding of what you read:
      
      1. Main Ideas
      • Finding the key message
      • Supporting details
      • Author's purpose
      
      2. Story Elements
      • Characters
      • Setting
      • Plot
      • Sequence of events
      
      Practice Story:
      "The Big Race"
      Sarah loved running. Every morning, she practiced at the park.
      The big race was coming soon. She trained harder than ever.
      On race day, Sarah was nervous but ready. She ran her best
      and won first place! Her family was very proud.
    `,
    practice: {
      type: "comprehension",
      exercises: [
        {
          type: "main-idea",
          text: "The Big Race",
          questions: [
            {
              question: "What is the main idea of the story?",
              options: [
                "Sarah's preparation and success in a race",
                "The importance of family support",
                "Daily running routines",
                "Different types of races"
              ],
              correct: 0
            }
          ]
        }
      ]
    },
    quiz: [
      {
        question: "What helped Sarah succeed in the race?",
        options: [
          "Daily practice",
          "Lucky shoes",
          "Weather conditions",
          "Having many friends"
        ],
        correct: 0,
        explanation: "The story mentions Sarah practiced every morning"
      }
    ]
  },
  {
    id: 4,
    title: "Advanced Reading Strategies",
    difficulty: "advanced",
    prerequisites: [1, 2, 3],
    estimatedTime: "90 minutes",
    content: `
      Master advanced reading techniques:
      
      1. Inferencing
      • Reading between the lines
      • Using context clues
      • Making predictions
      
      2. Critical Analysis
      • Author's perspective
      • Fact vs. opinion
      • Drawing conclusions
      
      3. Vocabulary Building
      • Context clues
      • Word roots
      • Multiple meanings
    `,
    practice: {
      type: "advanced-comprehension",
      exercises: [
        {
          type: "inference",
          scenarios: [
            {
              text: "Maria grabbed her umbrella before leaving.",
              question: "What can you infer about the weather?",
              options: [
                "It was raining or likely to rain",
                "It was sunny",
                "It was windy",
                "It was cold"
              ],
              correct: 0
            }
          ]
        }
      ]
    },
    quiz: [
      {
        question: "What does 'reading between the lines' mean?",
        options: [
          "Understanding implied meanings",
          "Reading very carefully",
          "Skipping lines while reading",
          "Reading multiple lines at once"
        ],
        correct: 0,
        explanation: "It means understanding ideas that aren't directly stated"
      }
    ]
  }
];

function calculateUserLevel(progress) {
  const scores = Object.values(progress).map(p => p.score);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  if (averageScore >= 90) return "advanced";
  if (averageScore >= 70) return "intermediate";
  return "beginner";
}

function getRecommendedModules(userProgress, completedModuleIds) {
  const userLevel = calculateUserLevel(userProgress);
  
  return modules
    .filter(module => {
      // Check prerequisites are completed
      const prereqsMet = module.prerequisites.every(id => 
        completedModuleIds.includes(id)
      );
      
      // Match difficulty to user level
      const difficultyMatch = 
        (userLevel === "beginner" && module.difficulty === "beginner") ||
        (userLevel === "intermediate" && ["beginner", "intermediate"].includes(module.difficulty)) ||
        (userLevel === "advanced");
        
      return prereqsMet && difficultyMatch;
    })
    .sort((a, b) => {
      // Prioritize modules of appropriate difficulty
      if (a.difficulty === userLevel && b.difficulty !== userLevel) return -1;
      if (b.difficulty === userLevel && a.difficulty !== userLevel) return 1;
      return 0;
    });
}

// Screen reader announcer component
const Announcer = ({ message }) => {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div 
      role="status"
      aria-live="polite"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};


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
  const [showMiniLesson, setShowMiniLesson] = useState(false);
  const [currentMiniLesson, setCurrentMiniLesson] = useState(null);
  const [userSettings, setUserSettings] = useState({
    fontSize: "normal",
    dyslexicFont: false,
    highContrast: false,
    audioEnabled: true,
    readingSpeed: "normal",
    screenReaderEnabled: true
  });
  
  const audioRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Load user progress
      const progressRef = ref(database, `progress/${currentUser.uid}`);
      get(progressRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUserProgress(snapshot.val());
        }
      });
      
      // Load user settings
      const settingsRef = ref(database, `settings/${currentUser.uid}`);
      get(settingsRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUserSettings(snapshot.val());
        }
      });
    }
  }, [currentUser]);

  
    // Function to update settings and announce changes
    const updateSettings = (setting, value) => {
      setUserSettings(prev => {
        const newSettings = { ...prev, [setting]: value };
        
        // Announce setting changes to screen readers
        let announcement = '';
        switch (setting) {
          case 'dyslexicFont':
            announcement = `${value ? 'Enabled' : 'Disabled'} OpenDyslexic font`;
            break;
          case 'audioEnabled':
            announcement = `${value ? 'Enabled' : 'Disabled'} audio feedback`;
            break;
          case 'screenReaderEnabled':
            announcement = `${value ? 'Enabled' : 'Disabled'} screen reader support`;
            break;
        }
        setAnnouncement(announcement);
        
        return newSettings;
      });
    };
  
    // Enhanced button component with accessibility
    const AccessibleButton = ({ onClick, children, ariaLabel, className }) => (
      <button
        onClick={onClick}
        className={className}
        aria-label={ariaLabel}
        role="button"
        tabIndex={0}
      >
        {children}
      </button>
    );

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
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
          timeSpent: timer,
          completedAt: new Date().toISOString()
        }
      };
      await set(progressRef, updatedProgress);
      setUserProgress(updatedProgress);
    }
  };

  const handleAnswerSubmit = (questionIndex, answerIndex) => {
    const currentQuiz = modules[activeModule].quiz[questionIndex];
    const isCorrect = answerIndex === currentQuiz.correct;
    
    if (!isCorrect && currentQuiz.miniLesson) {
      setCurrentMiniLesson(currentQuiz.miniLesson);
      setShowMiniLesson(true);
    } else {
      setUserAnswers({ ...userAnswers, [questionIndex]: answerIndex });
      if (questionIndex < modules[activeModule].quiz.length - 1) {
        setCurrentQuestion(questionIndex + 1);
      } else {
        handleQuizSubmit();
      }
    }
  };

  const handleQuizSubmit = () => {
    const score = calculateQuizScore();
    setQuizScore(score);
    setIsTimerRunning(false);
    saveProgress();
  };

  const calculateQuizScore = () => {
    let correct = 0;
    modules[activeModule].quiz.forEach((_, index) => {
      if (userAnswers[index] === modules[activeModule].quiz[index].correct) {
        correct++;
      }
    });
    return (correct / modules[activeModule].quiz.length) * 100;
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

  const playAudio = (audioFile) => {
    if (userSettings.audioEnabled && audioRef.current) {
      audioRef.current.src = audioFile;
      audioRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400/10 blur-xl"
          style={{
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `translate(-50%, -50%) translateY(${scrollY * Math.random() * 0.2}px)`,
            transition: "transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)",
            animation: `float ${Math.random() * 7 + 10}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );

  return (
      
<div className={`min-h-screen bg-black text-white overflow-x-hidden ${
      userSettings.dyslexicFont ? 'font-opendyslexic' : ''
    } ${userSettings.highContrast ? 'high-contrast' : ''}`}>
        
        {/* Settings Panel with enhanced accessibility */}
        <div 
          className="fixed top-4 right-4 flex space-x-4 bg-black/50 backdrop-blur-lg rounded-lg p-2"
          role="toolbar"
          aria-label="Accessibility settings"
        >
          <AccessibleButton
            onClick={() => updateSettings('audioEnabled', !userSettings.audioEnabled)}
            ariaLabel={`${userSettings.audioEnabled ? 'Disable' : 'Enable'} audio feedback`}
            className={`p-2 rounded-lg ${userSettings.audioEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <Volume2 className="h-5 w-5" />
          </AccessibleButton>
          
          <AccessibleButton
            onClick={() => updateSettings('dyslexicFont', !userSettings.dyslexicFont)}
            ariaLabel={`${userSettings.dyslexicFont ? 'Disable' : 'Enable'} OpenDyslexic font`}
            className={`p-2 rounded-lg ${userSettings.dyslexicFont ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <Book className="h-5 w-5" />
          </AccessibleButton>
          
          <AccessibleButton
            onClick={() => updateSettings('highContrast', !userSettings.highContrast)}
            ariaLabel={`${userSettings.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
            className={`p-2 rounded-lg ${userSettings.highContrast ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <Settings className="h-5 w-5" />
          </AccessibleButton>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-300% animate-gradient">
              Interactive Learning
            </span>
          </h1>
          <p className="text-xl text-white/80">
            Personalized learning path with adaptive exercises
          </p>
        </div>

        {/* Module Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {modules.map((module, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveModule(index);
                resetQuiz();
              }}
              className={`p-6 rounded-lg backdrop-blur-lg transition-all duration-300 ${
                activeModule === index
                  ? 'bg-blue-600/20 border border-blue-500/50 text-white scale-105'
                  : 'bg-black/50 border border-white/10 text-white/80 hover:border-white/30 hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{module.title}</span>
                {userProgress[index]?.completed && (
                  <Trophy className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>{module.estimatedTime}</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {module.difficulty}
                </span>
              </div>
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

        {/* Main Content */}
        <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-xl p-8 mb-8">
          {showMiniLesson && currentMiniLesson ? (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Quick Review</h3>
              <p className="text-lg mb-6">{currentMiniLesson.content}</p>
              <div className="flex justify-center space-x-4">
                {currentMiniLesson.audio && (
                  <button
                    onClick={() => playAudio(currentMiniLesson.audio)}
                    className="p-3 rounded-lg bg-blue-600"
                  >
                    <Headphones className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMiniLesson(false);
                    setCurrentMiniLesson(null);
                  }}
                  className="px-6 py-3 rounded-lg bg-blue-600"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : !showQuiz ? (
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
                    Start Practice
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
                <div>
                  <div className="flex items-center mb-6">
                    <Award className="h-8 w-8 text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold">Practice Questions</h2>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">
                      Question {currentQuestion + 1} of {modules[activeModule].quiz.length}
                    </h3>
                    <p className="text-lg mb-6 text-white/80">
                      {modules[activeModule].quiz[currentQuestion].question}
                    </p>
                    
                    {modules[activeModule].quiz[currentQuestion].audio && (
                      <button
                        onClick={() => playAudio(modules[activeModule].quiz[currentQuestion].audio)}
                        className="mb-6 p-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                      >
                        <Headphones className="h-5 w-5" />
                      </button>
                    )}
                    
                    <div className="space-y-3">
                      {modules[activeModule].quiz[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSubmit(currentQuestion, index)}
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
                    Practice Complete! Score: {quizScore.toFixed(1)}%
                  </h2>
                  
                  <div className="mb-8">
                    <p className="text-white/80 mb-4">
                      {quizScore >= 70
                        ? "Great job! You've mastered this module."
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