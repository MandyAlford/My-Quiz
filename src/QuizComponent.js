import React, { useEffect, useState } from "react";
import './QuizComponent.css';

const decodeHtmlEntities = (text) => {
  const element = document.createElement("div");
  if (text) {
    element.innerHTML = text;
    return element.textContent;
  }
  return text;
};

const QuizComponent = () => {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const fetchQuizData = async (retryCount = 0) => {
    try {
      const response = await fetch("https://opentdb.com/api.php?amount=10&category=17&difficulty=easy");

      if (response.status === 429) {
        const retryDelay = Math.pow(2, retryCount) * 1000; 
        console.log(`Too many requests, retrying in ${retryDelay / 1000} seconds...`);
        setTimeout(() => fetchQuizData(retryCount + 1), retryDelay);
      } else if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      } else {
        const data = await response.json();
        setQuizData(data.results || []);
        setLoading(false);
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  const handleAnswerClick = (questionIndex, answer) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answer
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Quiz</h1>
      {quizData && quizData.length > 0 ? (
        quizData.map((question, index) => {
          const shuffledAnswers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
          return (
            <div key={index}>
              <strong>Question {index + 1}:</strong> {decodeHtmlEntities(question.question)}
              <br />
              <div className="question-container">
                {shuffledAnswers.map((option, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAnswerClick(index, option)}
                    disabled={selectedAnswers[index] !== undefined}
                    className="quiz-button"
                  >
                    {decodeHtmlEntities(option)}
                  </button>
                ))}
              </div>
              {selectedAnswers[index] && (
                <div>
                  {selectedAnswers[index] === question.correct_answer
                    ? <span className="correct-answer">Correct!</span>
                    : <span className="wrong-answer">Wrong! The correct answer is {question.correct_answer}</span>}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div>No quiz data available</div>
      )}
    </div>
  );
};

export default QuizComponent;