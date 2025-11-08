import React, { useState, useEffect, useRef } from "react";

function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Idle 💤");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported on this browser!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setStatus("🎙️ Listening...");
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setTranscript(text);
      handleCommand(text);
    };
    recognition.onerror = () => {
      setStatus("❌ Error");
      setListening(false);
    };
    recognition.onend = () => {
      setStatus("Idle 💤");
      setListening(false);
      // Auto restart listening after few seconds
      setTimeout(() => startListening(), 1500);
    };

    recognitionRef.current = recognition;

    // Auto start listening when app opens
    startListening();

    // When app comes to foreground, restart mic
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        startListening();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Text-to-Speech (Natural voice)
  const speak = (text) => {
    setStatus("🔊 Speaking...");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN"; // Indian English accent
    utter.rate = 1;
    utter.pitch = 1; // make it deeper like a real Jarvis
    utter.voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.name.includes("Male") || v.name.includes("Google UK English Male"));
    utter.onend = () => setStatus("Idle 💤");
    window.speechSynthesis.speak(utter);
  };

  // Simple Knowledge Base
  const knowledgeBase = {
    "who are you": "I am Jarvis, your personal assistant created by Mayank.",
    "how are you": "I am always ready to help you!",
    "what is your purpose": "My purpose is to assist you with tasks and respond to your voice commands.",
  };

  // Command Handler
  const handleCommand = (command) => {
    if (command.includes("hello jarvis")) {
      speak(`Hello ${userName || "there"}, how can I help you today?`);
    } else if (command.includes("time")) {
      const time = new Date().toLocaleTimeString();
      speak(`The time is ${time}`);
    } else if (command.includes("date")) {
      const date = new Date().toLocaleDateString();
      speak(`Today's date is ${date}`);
    } else if (Object.keys(knowledgeBase).some((key) => command.includes(key))) {
      const key = Object.keys(knowledgeBase).find((k) => command.includes(k));
      speak(knowledgeBase[key]);
    } else if (command.includes("my name is")) {
      const name = command.replace("my name is", "").trim();
      if (name) {
        setUserName(name);
        localStorage.setItem("userName", name);
        speak(`Nice to meet you, ${name}!`);
      }
    } else if (command.includes("what is my name")) {
      if (userName) speak(`Your name is ${userName}`);
      else speak("I don't know your name yet. Please tell me by saying my name is...");
    } else if (command.includes("open youtube")) {
      speak("Opening YouTube");
      window.open("https://www.youtube.com", "_blank");
    } else if (command.includes("open instagram")) {
      speak("Opening Instagram");
      window.open("https://www.instagram.com", "_blank");
    } else if (command.includes("open google")) {
      speak("Opening Google");
      window.open("https://www.google.com", "_blank");
    } else if (command.includes("open gallery")) {
      speak("Opening Gallery");
      window.open("photos://", "_blank");
    } else if (command.includes("open camera")) {
      speak("Opening Camera");
      window.open("camera://", "_blank");
    } else if (command.includes("open phone")) {
      speak("Opening Phone dialer");
      window.open("tel://", "_blank");
    } else if (command.includes("search") && command.includes("youtube")) {
      const query = command.replace("search", "").replace("on youtube", "").trim();
      speak(`Searching ${query} on YouTube`);
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
    } else {
      speak("Sorry, I did not understand that command.");
    }
  };

  // Start Listening
  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript("");
      setListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#000",
        color: "#00ffcc",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1>🤖 Jarvis Assistant</h1>
      <p>Status: <b>{status}</b></p>
      <button
        onClick={startListening}
        disabled={listening}
        style={{
          backgroundColor: listening ? "#444" : "#00ffcc",
          color: "#000",
          borderRadius: "50%",
          width: "90px",
          height: "90px",
          fontSize: "30px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 20px #00ffcc",
        }}
      >
        🎙️
      </button>
      <p style={{ marginTop: "20px", fontSize: "18px" }}>
        You said: <b>{transcript || "..."}</b>
      </p>
      {userName && <p>👋 Welcome back, {userName}!</p>}
    </div>
  );
}

export default App;

