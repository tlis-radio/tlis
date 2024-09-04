import PlayerDisplay from "./song-data";
import PlayerControl from "./player-control";
import React, { useState, useRef } from 'react';

const Player: React.FC<{}> = () => {

   const audio = useRef<HTMLAudioElement | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const source = "https://stream.tlis.sk/tlis.mp3"

   return (
      <>
      <div
         className="flex items-center bg-[#2e2b2c] p-2 pr-11 gap-2 z-10
            lg:w-2/3 lg:pr-0 lg:relative lg:rounded-2xl lg:h-[70px] lg:top-[5px]
            xl:w-2/3 
            2xl:w-1/2 hidden lg:flex"
         // style={playerStyle}
      >
         <PlayerControl
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            audioSource={source}
            audioRef={audio}
         />
         <div className="mr-2 flex flex-col">
            <PlayerDisplay />
         </div>
      </div>
      </>
   );
   
};

// TODO: Add another file called PlayerContent which will contain the PlayerDisplay and PlayerControl components and based on the PlayerContent we will create 2 components called MobilePlayer and DesktopPlayer (find out which styles are applied for which player)
// fixed bottom-0 inset-x-0 w-full


export default Player;