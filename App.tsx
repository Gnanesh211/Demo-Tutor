import React, { useState, useRef, useEffect } from 'react';
import type { LiveSession, LiveServerMessage } from '@google/genai';
import { connectToLiveSession } from './services/geminiService';
import { decode, decodeAudioData, createBlob } from './utils/audio';
import TranscriptionCard from './components/TranscriptionCard';
import MicOnIcon from './components/icons/MicOnIcon';
import MicOffIcon from './components/icons/MicOffIcon';
import LanguageSelector from './components/LanguageSelector';

enum Status {
  IDLE = "Tap the mic to start your lesson.",
  LISTENING = "Listening...",
  CONNECTING = "Connecting to Toby...",
  SPEAKING = "Toby is speaking...",
  ERROR = "An error occurred. Please try again.",
}

interface Turn {
  userInput: string;
  modelOutput: string;
}

const App: React.FC = () => {
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [transcriptionHistory, setTranscriptionHistory] = useState<Turn[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Use refs for state that changes inside callbacks to avoid stale closures
  const currentInputRef = useRef(currentInput);
  const currentOutputRef = useRef(currentOutput);
  useEffect(() => {
    currentInputRef.current = currentInput;
    currentOutputRef.current = currentOutput;
  }, [currentInput, currentOutput]);

  const cleanup = () => {
    scriptProcessorRef.current?.disconnect();
    mediaStreamSourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(track => track.stop());
    inputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current?.close().catch(console.error);

    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current = null;
    streamRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
  };

  const startListening = async () => {
    if (!nativeLanguage) return;
    setStatus(Status.CONNECTING);
    try {
      // FIX: Cast window to `any` to support `webkitAudioContext` for older browsers.
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;
      audioSourcesRef.current.clear();

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionPromiseRef.current = connectToLiveSession(nativeLanguage, {
        onopen: () => {
          setStatus(Status.LISTENING);
          const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
          mediaStreamSourceRef.current = source;

          const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            setCurrentInput(prev => prev + message.serverContent.inputTranscription.text);
          }
          if (message.serverContent?.outputTranscription) {
            setCurrentOutput(prev => prev + message.serverContent.outputTranscription.text);
             if (status !== Status.SPEAKING) {
                setStatus(Status.SPEAKING);
             }
          }
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            const audioContext = outputAudioContextRef.current!;
            const decodedAudio = decode(audioData);
            const audioBuffer = await decodeAudioData(decodedAudio, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                    setStatus(Status.LISTENING);
                }
            });
            
            const currentTime = audioContext.currentTime;
            const startTime = Math.max(currentTime, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
            audioSourcesRef.current.add(source);
          }

          if(message.serverContent?.turnComplete) {
              const finalInput = currentInputRef.current + (message.serverContent?.inputTranscription?.text || '');
              const finalOutput = currentOutputRef.current + (message.serverContent?.outputTranscription?.text || '');
              
              if(finalInput.trim() || finalOutput.trim()){
                 setTranscriptionHistory(prev => [...prev, { userInput: finalInput, modelOutput: finalOutput }]);
              }
              
              setCurrentInput('');
              setCurrentOutput('');
          }
        },
        onerror: (e: ErrorEvent) => {
          console.error("Session error:", e);
          setStatus(Status.ERROR);
          cleanup();
        },
        onclose: (e: CloseEvent) => {
          cleanup();
        },
      });

    } catch (err) {
      console.error('Failed to start microphone:', err);
      setStatus(Status.ERROR);
    }
  };

  const stopListening = async () => {
    setStatus(Status.IDLE);
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        } finally {
            sessionPromiseRef.current = null;
        }
    }
    cleanup();
  };

  const handleMicClick = () => {
    if (status === Status.LISTENING || status === Status.SPEAKING || status === Status.CONNECTING) {
      stopListening();
    } else {
      startListening();
    }
  };
    
  useEffect(() => {
    // Scroll to bottom when new transcriptions are added
    const scrollContainer = document.getElementById('transcription-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [transcriptionHistory, currentInput, currentOutput]);

  const handleLanguageSelect = (language: string) => {
    setNativeLanguage(language);
  };

  if (!nativeLanguage) {
    return <LanguageSelector onSelectLanguage={handleLanguageSelect} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">T</div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">LinguaMaster AI</h1>
                    <p className="text-sm text-green-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        Toby is online
                    </p>
                </div>
            </div>
            <button 
              onClick={() => {
                stopListening();
                setNativeLanguage(null);
              }}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Change Language
            </button>
        </div>
      </header>
      <main id="transcription-container" className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 space-y-4 overflow-y-auto">
         {transcriptionHistory.map((turn, index) => (
           <TranscriptionCard key={index} userInput={turn.userInput} modelOutput={turn.modelOutput} />
         ))}
         {(currentInput || currentOutput) && (
            <TranscriptionCard userInput={currentInput} modelOutput={currentOutput} />
         )}
         {transcriptionHistory.length === 0 && !currentInput && !currentOutput && status === Status.IDLE && (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-semibold">Welcome!</h2>
                    <p>Tap the microphone button below to start your first lesson.</p>
                </div>
            </div>
         )}
      </main>
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-3">
          <button
            onClick={handleMicClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              (status === Status.LISTENING || status === Status.SPEAKING || status === Status.CONNECTING) 
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
            aria-label={ (status === Status.LISTENING || status === Status.SPEAKING || status === Status.CONNECTING) ? "Stop listening" : "Start listening"}
          >
            {(status === Status.LISTENING || status === Status.SPEAKING || status === Status.CONNECTING) ? (
                <MicOnIcon className="w-8 h-8 text-white animate-pulse" />
            ) : (
                <MicOffIcon className="w-8 h-8 text-white" />
            )}
          </button>
          <p className="text-sm text-gray-600 h-5">{status}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
