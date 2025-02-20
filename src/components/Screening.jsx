import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardCheck, AlertCircle } from 'lucide-react';

function Screening() {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      text: "Does the individual have difficulty remembering the sequence of letters in words?",
      category: "Reading",
    },
    {
      id: 2,
      text: "Is there a family history of reading or spelling difficulties?",
      category: "Background",
    },
    {
      id: 3,
      text: "Does the individual struggle with rhyming words?",
      category: "Phonological",
    },
    {
      id: 4,
      text: "Is there difficulty in organizing written and spoken language?",
      category: "Expression",
    },
    {
      id: 5,
      text: "Does the individual have trouble remembering sight words?",
      category: "Reading",
    },
  ];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentStep]: value });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const calculateRisk = () => {
    const yesAnswers = Object.values(answers).filter(answer => answer === true).length;
    const percentage = (yesAnswers / questions.length) * 100;
    
    if (percentage >= 60) return "High";
    if (percentage >= 30) return "Moderate";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dyslexia Screening Tool</h1>
          <p className="text-xl text-gray-600">
            This screening tool helps identify potential signs of dyslexia. 
            Please note that this is not a diagnostic tool.
          </p>
        </div>

        {currentStep < questions.length ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{questions[currentStep].category}</span>
              </div>
              <h2 className="text-xl font-semibold mb-6">{questions[currentStep].text}</h2>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  No
                </button>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <ClipboardCheck className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Screening Complete</h2>
              <div className="mb-8">
                <p className="text-lg mb-2">Risk Level: <span className="font-semibold">{calculateRisk()}</span></p>
                <p className="text-gray-600">
                  Based on your responses, there are indicators suggesting a {calculateRisk().toLowerCase()} risk of dyslexia.
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <ul className="text-left text-gray-700 space-y-2">
                  <li>• Consult with an educational psychologist or learning specialist</li>
                  <li>• Share these results with teachers or education professionals</li>
                  <li>• Explore our resources section for support materials</li>
                </ul>
              </div>

              {!currentUser && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-700">
                    Create an account to save your results and access personalized resources
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