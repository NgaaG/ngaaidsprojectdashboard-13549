import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string, audioUrl: string) => void;
}

export const AudioRecorder = ({ onTranscriptionComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak your brain dump...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Upload to Supabase storage
      const { supabase } = await import("@/integrations/supabase/client");
      const fileName = `${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-reflections')
        .upload(fileName, audioBlob);

      if (uploadError) {
        throw uploadError;
      }

      const audioPath = uploadData.path;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-reflections')
        .getPublicUrl(audioPath);

      // Call transcription edge function
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
        'transcribe-audio',
        { body: { audioPath } }
      );

      if (transcriptionError) {
        throw transcriptionError;
      }

      const transcription = transcriptionData.transcription;
      
      toast({
        title: "Transcription complete",
        description: "Your brain dump has been transcribed!",
      });

      onTranscriptionComplete(transcription, publicUrl);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process audio recording.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isProcessing && (
        <Button
          onClick={startRecording}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Mic className="h-4 w-4" />
          Record Audio
        </Button>
      )}
      
      {isRecording && (
        <Button
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          className="gap-2 animate-pulse"
        >
          <Square className="h-4 w-4" />
          Stop Recording
        </Button>
      )}
      
      {isProcessing && (
        <Button variant="outline" size="sm" disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </Button>
      )}
    </div>
  );
};