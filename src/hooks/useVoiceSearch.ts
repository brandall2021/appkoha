import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from "expo-speech-recognition";

interface UseVoiceSearchOptions {
  lang?: string;
  onResult?: (text: string) => void;
}

function translateError(code: ExpoSpeechRecognitionErrorCode): string {
  switch (code) {
    case "no-speech":
      return "No se detecto voz. Intenta de nuevo.";
    case "not-allowed":
      return "Permiso de microfono denegado.";
    case "service-not-allowed":
      return "El reconocimiento de voz no esta disponible en este dispositivo.";
    case "language-not-supported":
      return "El idioma del reconocimiento no esta soportado.";
    case "network":
      return "Se requiere conexion a internet para el reconocimiento.";
    case "audio-capture":
      return "Error al capturar el audio.";
    case "busy":
      return "El reconocimiento esta ocupado. Intenta de nuevo.";
    case "interrupted":
      return "El reconocimiento fue interrumpido.";
    default:
      return "No se pudo reconocer la voz. Intenta de nuevo.";
  }
}

export function useVoiceSearch({ lang = "es-ES", onResult }: UseVoiceSearchOptions = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const finalRef = useRef("");
  const lastRef = useRef("");
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    try {
      setSupported(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setSupported(false);
    }
  }, []);

  useSpeechRecognitionEvent("start", () => {
    setListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results.map((r) => r.transcript).join(" ");
    setTranscript(text);
    lastRef.current = text;
    if (event.isFinal) {
      finalRef.current = text;
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setListening(false);
    const final = finalRef.current.trim() || lastRef.current.trim();
    if (final) {
      onResultRef.current?.(final);
    }
    finalRef.current = "";
    lastRef.current = "";
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted") return;
    setListening(false);
    setError(translateError(event.error));
  });

  useSpeechRecognitionEvent("nomatch", () => {
    setListening(false);
    setError("No se detecto voz. Intenta de nuevo.");
  });

  const start = useCallback(async () => {
    setTranscript("");
    setError(null);
    finalRef.current = "";
    lastRef.current = "";
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Permiso de microfono denegado.");
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: false,
        iosTaskHint: "search",
        androidIntentOptions: { EXTRA_LANGUAGE_MODEL: "web_search" },
      });
    } catch {
      setError("No se pudo iniciar el reconocimiento de voz.");
    }
  }, [lang]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const abort = useCallback(() => {
    finalRef.current = "";
    lastRef.current = "";
    ExpoSpeechRecognitionModule.abort();
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return { listening, transcript, error, supported, start, stop, abort, reset };
}
