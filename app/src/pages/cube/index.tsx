import { NextPage } from "next";
import React, { Suspense } from "react";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CubeEditor } from "../../global_building_blocks/cube/cube";

const CubePage: NextPage = () => {
    return (
        <Canvas
            camera={{
                position: [10, 10, 10],
                fov: 50,
            }}
        >
            <ambientLight />
            <Suspense fallback={null}>
                <ContactShadows
                    position={[0, -4, 0]}
                    opacity={0.4}
                    width={10}
                    height={10}
                    blur={2}
                    far={20}
                />
                {/* <Environment preset="sunset" /> */}
                <CubeEditor />
            </Suspense>
            <OrbitControls />
        </Canvas>
    );
};

export default CubePage;
