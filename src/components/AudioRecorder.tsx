import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Play, Pause, RotateCcw, Trash2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string, audioUrl: string) => void;
}

export const AudioRecorder = ({ onTranscriptionComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

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

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Recording saved",
          description: "You can now preview, re-record, or transcribe your audio.",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setHasRecording(false);
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

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
    setAudioBlob(null);
    setHasRecording(false);
    setIsPlaying(false);
    startRecording();
  };

  const handleDelete = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
    setAudioBlob(null);
    setHasRecording(false);
    setIsPlaying(false);
    toast({
      title: "Recording deleted",
      description: "Your recording has been removed.",
    });
  };

  const handleSaveAndTranscribe = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const fileName = `${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-reflections')
        .upload(fileName, audioBlob);

      if (uploadError) {
        throw uploadError;
      }

      const audioPath = uploadData.path;
      
      const { data: { publicUrl } } = supabase.storage
        .from('audio-reflections')
        .getPublicUrl(audioPath);

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
        description: "Your brain dump has been transcribed and fields will be auto-filled!",
      });

      // Clean up
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl("");
      setAudioBlob(null);
      setHasRecording(false);

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
    <div className="space-y-3">
      {/* Main Controls */}
      <div className="flex items-center gap-2">
        {!isRecording && !hasRecording && !isProcessing && (
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

      {/* Recording Preview Controls */}
      {hasRecording && !isProcessing && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-medium">Recording ready - choose an action:</p>
            
            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleReRecord}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Re-record
              </Button>
              
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              
              <Button
                onClick={handleSaveAndTranscribe}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Save & Transcribe
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Click "Save & Transcribe" to auto-fill reflection fields
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};