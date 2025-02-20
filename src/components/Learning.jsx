import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, Award, Brain, CheckCircle, XCircle, RefreshCw, 
  PlayCircle, PauseCircle, Volume2, Star, Trophy, Timer
} from 'lucide-react';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';

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
      audioExample: "https://example.com/phonological-awareness.mp3",
      interactiveExercise: {
        type: "sound-matching",
        words: ["cat", "hat", "bat", "rat"],
        target: "at"
      },
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
      title: "Multisensory Learning Techniques",
      content: `
        Multisensory learning engages multiple senses simultaneously:
        • Visual (seeing)
        • Auditory (hearing)
        • Kinesthetic (moving)
        • Tactile (touching)

        Benefits:
        • Stronger neural connections
        • Better memory retention
        • Improved learning outcomes
        • Enhanced engagement

        Practical Applications:
        1. Sand Writing: Write letters in sand while saying their sounds
        2. Air Writing: Draw letters in the air while speaking
        3. Letter Building: Create letters using clay or playdough
        4. Sound Tapping: Tap out syllables while speaking words
      `,
      interactiveExercise: {
        type: "virtual-sandtray",
        instructions: "Use your mouse to 'write' letters in the virtual sand"
      },
      quiz: [
        {
          question: "Which sense is NOT typically involved in multisensory learning?",
          options: ["Taste", "Touch", "Sight", "Sound"],
          correct: 0,
          explanation: "While taste can be used in some learning activities, it's not typically one of the main senses involved in multisensory learning approaches."
        },
        {
          question: "What is a benefit of multisensory learning?",
          options: ["Less engagement", "Stronger memory", "Faster reading", "Simple teaching"],
          correct: 1,
          explanation: "Multisensory learning creates stronger memory connections by engaging multiple senses simultaneously."
        },
        {
          question: "Which activity combines visual and kinesthetic learning?",
          options: ["Listening to audiobooks", "Air writing", "Reading silently", "Watching videos"],
          correct: 1,
          explanation: "Air writing combines visual learning (seeing the letter shape) with kinesthetic learning (moving to form the letter)."
        }
      ]
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Learning</h1>
          <p className="text-xl text-gray-600">
            Master key concepts through interactive lessons and quizzes
          </p>
        </div>

        {/* Module Navigation */}
        <div className="flex justify-center space-x-4 mb-8">
          {modules.map((module, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveModule(index);
                resetQuiz();
              }}
              className={`px-6 py-3 rounded-lg flex items-center ${
                activeModule === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } shadow-md transition duration-200`}
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
          <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow">
            <Timer className="h-5 w-5 text-indigo-600" />
            <span className="font-mono">{formatTime(timer)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-indigo-600"
            >
              {isTimerRunning ? (
                <PauseCircle className="h-5 w-5" />
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {!showQuiz ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
                  <h2 className="text-2xl font-bold">{modules[activeModule].title}</h2>
                </div>
                {modules[activeModule].audioExample && (
                  <button className="flex items-center text-indigo-600">
                    <Volume2 className="h-5 w-5 mr-1" />
                    Listen
                  </button>
                )}
              </div>
              <div className="prose max-w-none">
                {modules[activeModule].content.split('\n').map((line, index) => (
                  <p key={index} className="mb-4 text-gray-700">
                    {line}
                  </p>
                ))}
              </div>
              {modules[activeModule].interactiveExercise && (
                <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Interactive Exercise</h3>
                  <p className="text-gray-700">
                    {modules[activeModule].interactiveExercise.instructions}
                  </p>
                </div>
              )}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowQuiz(true);
                    setIsTimerRunning(true);
                  }}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Take Quiz
                </button>
              </div>
            </div>
          ) : (
            <div>
              {quizScore === null ? (
                <div>
                  <div className="flex items-center mb-6">
                    <Award className="h-8 w-8 text-indigo-600 mr-3" />
                    <h2 className="text-2xl font-bold">Module Quiz</h2>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">
                      Question {currentQuestion + 1} of {modules[activeModule].quiz.length}
                    </h3>
                    <p className="text-lg mb-6">
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
                          className={`w-full text-left p-4 rounded-lg border ${
                            userAnswers[currentQuestion] === index
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          } transition duration-200`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    {quizScore >= 70 ? (
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Quiz Complete! Score: {quizScore}%
                  </h2>
                  <div className="mb-8">
                    <p className="text-gray-600 mb-4">
                      {quizScore >= 70
                        ? "Great job! You've mastered this module."
                        : "Keep practicing! Review the material and try again."}
                    </p>
                    <p className="text-gray-600">
                      Time taken: {formatTime(timer)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="mb-8 text-indigo-600 hover:text-indigo-700"
                  >
                    {showExplanation ? "Hide" : "Show"} Explanations
                  </button>
                  {showExplanation && (
                    <div className="mb-8 text-left">
                      {modules[activeModule].quiz.map((question, index) => (
                        <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <p className="font-semibold mb-2">{question.question}</p>
                          <p className="text-gray-600 mb-2">
                            Your answer: {question.options[userAnswers[index]]}
                          </p>
                          <p className="text-gray-600">
                            Explanation: {question.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetQuiz}
                      className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        resetQuiz();
                        setActiveModule((activeModule + 1) % modules.length);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                      Next Module
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Tracking */}
        {currentUser && (
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Your Learning Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              {modules.map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span>Module {index + 1}</span>
                    <div className="flex items-center">
                      {userProgress[index]?.completed && (
                        <div className="flex items-center mr-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm">{userProgress[index].score}%</span>
                        </div>
                      )}
                      <span className="text-indigo-600">
                        {userProgress[index]?.completed ? '100%' : index === activeModule ? '50%' : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${userProgress[index]?.completed ? 100 : index === activeModule ? 50 : 0}%`,
                      }}
                    ></div>
                  </div>
                  {userProgress[index]?.timeSpent && (
                    <p className="text-sm text-gray-600 mt-2">
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