import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";

const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);
  if (!loading) return null;
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = ({ selectedCharacter, selectedAnimation }) => {
  const cameraControls = useRef();
  const { cameraZoomed } = useChat();

  // Only set initial camera position on mount
  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 1.2, 3.5, 0, 1, 0);
    }
  }, []);

  useEffect(() => {
    if (!cameraControls.current) return;
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.2, 2.2, 0, 1, 0, true); // Full body zoomed
    } else {
      cameraControls.current.setLookAt(0, 1.2, 3.5, 0, 1, 0, true); // Full body unzoomed
    }
    // After moving, user can freely zoom/orbit
  }, [cameraZoomed]);

  // Auto-focus camera on character change
  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 1.2, 3.5, 0, 1, 0, true);
    }
  }, [selectedCharacter]);

  return (
    <>
      <CameraControls
        ref={cameraControls}
        enabled={true}
        dollyToCursor={true}
        minDistance={1.2}
        maxDistance={10}
      />
      <Environment preset="sunset" />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      <Avatar
        modelPath={`/models/${selectedCharacter}`}
        selectedAnimation={selectedAnimation}
      />
      <ContactShadows opacity={0.7} />
    </>
  );
};
