import React, { useEffect, useState, useCallback, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

const APP_ID = '5ffdc1e47814460db593cce32f48def5';
const TOKEN = '007eJxTYNj6n6cmm71sUp2FTIZ3/7kwpy9M4Z8WfKw65XAu8Fv1jnUKDKZpaSnJhqkm5haGJiZmBilJppbGycmpxkZpJhYpqWmm9h960hoCGRnkNu5kYIRCEJ+dwSUxuySxKJOBAQD7rCIA';
const CHANNEL = 'Daktari';

const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const hasJoined = useRef(false);
  const isJoining = useRef(false);

  const handleUserJoined = useCallback(async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === 'audio') {
      // user.audioTrack.play()
    }
  }, []);

  const handleUserLeft = useCallback((user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  }, []);

  useEffect(() => {
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    const setupAgora = async () => {
      if (hasJoined.current || isJoining.current) return;

      try {
        isJoining.current = true;
        const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        setLocalTracks([audioTrack, videoTrack]);
        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack,
            audioTrack,
          },
        ]);
        
        await client.publish([audioTrack, videoTrack]);
        hasJoined.current = true;
      } catch (error) {
        console.error("Error setting up Agora:", error);
      } finally {
        isJoining.current = false;
      }
    };

    setupAgora();

    return () => {
      if (hasJoined.current) {
        for (let localTrack of localTracks) {
          localTrack.stop();
          localTrack.close();
        }
        client.off('user-published', handleUserJoined);
        client.off('user-left', handleUserLeft);
        client.unpublish(localTracks).then(() => {
          client.leave();
          hasJoined.current = false;
        }).catch(console.error);
      }
    };
  }, [handleUserJoined, handleUserLeft]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 200px)' }}>
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
};