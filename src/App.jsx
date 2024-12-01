import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as speechCommands from "@tensorflow-models/speech-commands";

function App() {
  const [recognizer, setRecognizer] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    async function loadRecognizer() {
      try {
       const recognizerInstance = 
       speechCommands.create('BROWSER_FFT', null, 
                             'http://localhost:8080/model.json', 
                             'http://localhost:8080/metadata.json'); 
        
        await recognizerInstance.ensureModelLoaded();
        setRecognizer(recognizerInstance);
        console.log(recognizer)
        console.log("Recognizer loaded successfully");
      } catch (error) {
        console.error("Error loading recognizer:", error);
      }
    }

    loadRecognizer();

    return () => {
      if (recognizer) {
        recognizer.stopListening();
        console.log("Recognizer stopped");
      }
    };
  }, []);

  const startRecognition = () => {
    if (recognizer && !isListening) {
      setIsListening(true);
      console.log(recognizer)
      try {
        recognizer.listen(
          (result) => {
           const scores = result.scores; // Array of scores
          const labels = recognizer.wordLabels(); // Retrieve word labels from the recognizer
          console.log("Scores:", scores);

          // Map scores to corresponding labels
          const predictions = labels.map((label, index) => ({
            word: label,
            score: scores[index],
          }));

          // Log the predictions sorted by score
          predictions.sort((a, b) => b.score - a.score); // Sort descending by score
          console.log("Predictions:", predictions);

          // Find the most likely prediction
          const bestPrediction = predictions[0];
          console.log("Best Prediction:", bestPrediction);
        
          },
          {
            includeSpectrogram: true,
            probabilityThreshold: 0.75, // Lowered threshold for debugging
          }
        );
        console.log("Listening started");

        setTimeout(() => {
          recognizer.stopListening();
          setIsListening(false);
          console.log("Listening stopped after timeout");
        }, 20000); // Stop after 10 seconds
      } catch (error) {
        console.error("Error during recognition:", error);
        setIsListening(false);
      }
    } else if (!recognizer) {
      console.error("Recognizer is not loaded yet");
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={startRecognition} disabled={isListening}>
          {isListening ? "Listening..." : "Start Recognition"}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
