import React, { useEffect, useState } from "react";

const QuizComponent = () => {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Quiz</h1>
      <ul>
        {quizData && quizData.length > 0 ? (
          quizData.map((question, index) => (
            <li key={index}>
              <strong>Question {index + 1}:</strong> {question.question}
              <br />
              <strong>Correct Answer:</strong> {question.correct_answer}
              <br />
              <strong>Options:</strong>
              <ul>
                {question.incorrect_answers.concat(question.correct_answer).map((option, i) => (
                  <li key={i}>{option}</li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <li>No quiz data available</li>
        )}
      </ul>
    </div>
  );
};

export default QuizComponent;

