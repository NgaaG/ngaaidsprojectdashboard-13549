import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

interface PresenceState {
  [key: string]: Array<{
    viewer_type: 'student' | 'lecturer';
    online_at: string;
  }>;
}

export const usePresence = (channelName: string) => {
  const [searchParams] = useSearchParams();
  const [studentOnline, setStudentOnline] = useState(false);
  const [lecturerCount, setLecturerCount] = useState(0);
  
  // Determine viewer type based on URL parameter
  const isLecturer = searchParams.get('viewer') === 'true' || 
                     sessionStorage.getItem('viewer-mode') === 'true';
  const viewerType = isLecturer ? 'lecturer' : 'student';

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: crypto.randomUUID(),
        },
      },
    });

    const updateCounts = () => {
      const state = channel.presenceState() as PresenceState;
      let students = 0;
      let lecturers = 0;
      
      Object.values(state).forEach((presences) => {
        presences.forEach((presence) => {
          if (presence.viewer_type === 'student') {
            students++;
          } else if (presence.viewer_type === 'lecturer') {
            lecturers++;
          }
        });
      });
      
      setStudentOnline(students > 0);
      setLecturerCount(lecturers);
    };

    channel
      .on('presence', { event: 'sync' }, updateCounts)
      .on('presence', { event: 'join' }, updateCounts)
      .on('presence', { event: 'leave' }, updateCounts)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            viewer_type: viewerType,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, viewerType]);

  return { studentOnline, lecturerCount };
};
