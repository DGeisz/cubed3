import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { CubeModel } from "../../global_architecture/cube_model/cube_model";
import { FixedCube } from "../cube/cube";

const cube = new CubeModel();
const ang = Math.PI / 4;

const CubeBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 6] }}>
                {/* <color attach="background" args={["#262626"]} /> */}

                <Stars
                    radius={100} // Radius of the inner sphere (default=100)
                    depth={50} // Depth of area where stars should fit (default=50)
                    count={5000} // Amount of stars (default=5000)
                    factor={4} // Size factor (default=4)
                    saturation={0} // Saturation 0-1 (default=0)
                    fade // Faded dots (default=false)
                />
                <ambientLight color="white" />
                <pointLight position={[10, 10, -10]} />
                <FixedCube
                    rotation={[ang, ang, 0]}
                    cubeModel={cube}
                    position={[0, 0, 0]}
                    distanceToViewer={1}
                />
                <OrbitControls autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default CubeBackground;
