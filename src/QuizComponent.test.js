import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; 
import QuizComponent from './QuizComponent';

beforeAll(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  fetch.mockClear();
});

describe('QuizComponent', () => {
  test('displays loading state initially', () => {
    act(() => {
      render(<QuizComponent />);
    });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch"))
    );

    await act(async () => {
      render(<QuizComponent />);
    });

    await waitFor(() => expect(screen.getByText(/error fetching data/i)).toBeInTheDocument());
  });

  test('displays quiz questions correctly and handles answer selection', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              question: "What is the capital of France?",
              correct_answer: "Paris",
              incorrect_answers: ["London", "Rome", "Berlin"]
            }
          ]
        })
      })
    );

    await act(async () => {
      render(<QuizComponent />);
    });

    await waitFor(() => expect(screen.getByText(/What is the capital of France?/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/London/i));
    expect(screen.getByText(/Wrong! The correct answer is Paris/i)).toBeInTheDocument();

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              question: "What is the capital of Germany?",
              correct_answer: "Berlin",
              incorrect_answers: ["Munich", "Frankfurt", "Hamburg"]
            }
          ]
        })
      })
    );
  });

  test('retries when API returns 429 status', async () => {
    jest.useFakeTimers();

    let retryCount = 0;
    fetch.mockImplementation(() => {
      retryCount += 1;
      if (retryCount < 2) {
        return Promise.resolve({
          status: 429,
          ok: false,
          json: () => Promise.resolve({})
        });
      }
      return Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              question: "What is the capital of Germany?",
              correct_answer: "Berlin",
              incorrect_answers: ["Munich", "Frankfurt", "Hamburg"]
            }
          ]
        })
      });
    });

    await act(async () => {
      render(<QuizComponent />);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => expect(screen.getByText(/What is the capital of Germany?/i)).toBeInTheDocument());

    jest.useRealTimers();
  });
});