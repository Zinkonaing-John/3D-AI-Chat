import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useState, useRef, useEffect } from "react";

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState(
    "64f1a714fe61576b46f27ca2.glb",
    "68761905789db9affbd8db00.glb"
  );
  const [selectedAnimation, setSelectedAnimation] = useState("Idle");
  const [language, setLanguage] = useState("en");
  const characters = [
    { name: "Character 1", file: "64f1a714fe61576b46f27ca2.glb" },
  ];
  const animations = [
    "Idle",
    "Talking_0",
    "Talking_1",
    "Talking_2",
    "Crying",
    "Laughing",
    "Rumba",
    "Terrified",
    "Angry",
  ];
  // Fallback image for character thumbnails
  const fallbackThumb = "/models/placeholder.png";
  // Centered nav bar for animation and language
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI language={language} setLanguage={setLanguage} />
      {/* Animation and language pickers under the main UI box, left side */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 10,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <select
            id="animation-picker"
            value={selectedAnimation}
            onChange={(e) => setSelectedAnimation(e.target.value)}
            style={{
              padding: 4,
              borderRadius: 4,
              border: "1px solid #f472b6",
              marginRight: 16,
            }}
          >
            {animations.map((anim) => (
              <option key={anim} value={anim}>
                {anim}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: 4, borderRadius: 4, border: "1px solid #f472b6" }}
          >
            <option value="en">English</option>
            <option value="ko">한국어 (Korean)</option>
          </select>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 20,
          display: "flex",
          flexDirection: "row",
        }}
      >
        {characters.map((char) => {
          // Derive thumbnail path from file name (replace .glb with .png)
          const thumb = `/models/${char.file.replace(".glb", ".png")}`;
          return (
            <button
              key={char.file}
              onClick={() => setSelectedCharacter(char.file)}
              style={{
                marginRight: 8,
                padding: 8,
                background:
                  selectedCharacter === char.file ? "#f472b6" : "#fff",
                color: selectedCharacter === char.file ? "#fff" : "#000",
                border: "1px solid #f472b6",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 80,
              }}
            >
              <img
                src={thumb}
                alt={char.name}
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                  borderRadius: 4,
                  marginBottom: 4,
                  border:
                    selectedCharacter === char.file
                      ? "2px solid #fff"
                      : "2px solid #f472b6",
                  background: "#eee",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackThumb;
                }}
              />
            </button>
          );
        })}
      </div>
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience
          selectedCharacter={selectedCharacter}
          selectedAnimation={selectedAnimation}
        />
      </Canvas>
    </>
  );
}

export default App;
