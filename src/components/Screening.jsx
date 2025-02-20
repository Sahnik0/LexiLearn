import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { 
  ClipboardCheck, AlertCircle, ChevronRight, 
  Brain, CheckCircle, XCircle, RefreshCw,
  BarChart, Book, Users, ArrowRight
} from 'lucide-react';

function Screening() {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [previousResults, setPreviousResults] = useState(null);

  const questions = [
    {
      id: 1,
      text: "Does the individual have difficulty remembering the sequence of letters in words?",
      category: "Reading",
      icon: <Book className="h-6 w-6 text-blue-400" />
    },
    {
      id: 2,
      text: "Is there a family history of reading or spelling difficulties?",
      category: "Background",
      icon: <Users className="h-6 w-6 text-blue-400" />
    },
    {
      id: 3,
      text: "Does the individual struggle with rhyming words?",
      category: "Phonological",
      icon: <Brain className="h-6 w-6 text-blue-400" />
    },
    {
      id: 4,
      text: "Is there difficulty in organizing written and spoken language?",
      category: "Expression",
      icon: <Book className="h-6 w-6 text-blue-400" />
    },
    {
      id: 5,
      text: "Does the individual have trouble remembering sight words?",
      category: "Reading",
      icon: <Book className="h-6 w-6 text-blue-400" />
    }
  ];

  useEffect(() => {
    const loadPreviousResults = async () => {
      if (currentUser) {
        try {
          const resultsRef = ref(database, `screenings/${currentUser.uid}/latest`);
          const snapshot = await get(resultsRef);
          if (snapshot.exists()) {
            setPreviousResults(snapshot.val());
          }
        } catch (error) {
          console.error("Error loading previous results:", error);
        }
      }
    };

    loadPreviousResults();
  }, [currentUser]);

  const handleAnswer = async (value) => {
    const newAnswers = { ...answers, [currentStep]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentUser) {
      setLoading(true);
      try {
        const result = {
          answers: newAnswers,
          timestamp: new Date().toISOString(),
          riskLevel: calculateRisk(newAnswers)
        };
        await set(ref(database, `screenings/${currentUser.uid}/latest`), result);
      } catch (error) {
        console.error("Error saving results:", error);
      }
      setLoading(false);
    }
  };

  const calculateRisk = (answers) => {
    const yesAnswers = Object.values(answers).filter(answer => answer === true).length;
    const percentage = (yesAnswers / questions.length) * 100;
    
    if (percentage >= 60) return "High";
    if (percentage >= 30) return "Moderate";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/10 blur-xl animate-float"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 7 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-300% animate-gradient">
              Dyslexia Screening
            </span>
          </h1>
          <p className="text-xl text-white/80">
            Complete this screening to identify potential signs of dyslexia
          </p>
        </div>

        {currentStep < questions.length ? (
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span className="flex items-center gap-2">
                  {questions[currentStep].icon}
                  {questions[currentStep].category}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-8">{questions[currentStep].text}</h2>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <XCircle className="h-5 w-5" />
                  No
                </button>
              </div>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="text-center">
              {loading ? (
                <RefreshCw className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              )}
              <h2 className="text-3xl font-bold mb-4">Screening Complete</h2>
              <div className="mb-8">
                <p className="text-xl mb-2">
                  Risk Level: {' '}
                  <span className={`font-semibold ${
                    calculateRisk(answers) === 'High' ? 'text-red-400' :
                    calculateRisk(answers) === 'Moderate' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {calculateRisk(answers)}
                  </span>
                </p>
                <p className="text-white/80">
                  Based on your responses, there are indicators suggesting a {calculateRisk(answers).toLowerCase()} risk of dyslexia.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-400" />
                  Recommended Next Steps
                </h3>
                <ul className="text-left text-white/80 space-y-3">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                    Consult with an educational psychologist or learning specialist
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                    Share these results with teachers or education professionals
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                    Explore our resources section for support materials
                  </li>
                </ul>
              </div>

              {!currentUser && (
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <AlertCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-white/80">
                    Create an account to save your results and access personalized resources
                  </p>
                </div>
              )}

              {previousResults && (
                <div className="mt-8 p-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-2">Previous Screening</h3>
                  <p className="text-white/60">
                    Last completed: {new Date(previousResults.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-white/60">
                    Previous risk level: {previousResults.riskLevel}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Screening;