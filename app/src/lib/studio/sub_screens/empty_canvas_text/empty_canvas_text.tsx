import React, { useMemo, useRef } from "react";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { useFrame } from "@react-three/fiber";
import TitWeb from "../../../../global_fonts/tit_web.json";
import { StickerColorHex } from "../../../../global_architecture/cube_model/cube_model";
import { EmptyCanvasMessage } from "../../messages/messages";
import { ContactShadows } from "@react-three/drei";

const textColor = StickerColorHex.Yellow;

interface EmptyCanvasProps {
    loading: boolean;
}

const EmptyCanvasText: React.FC<EmptyCanvasProps> = (props) => {
    const textRef = useRef<any>();

    const font = useMemo(() => new FontLoader().parse(TitWeb), []);

    const topText = useMemo(() => {
        const textOptions = {
            font,
            size: 1,
            height: 0.1,
        };

        return new TextGeometry(
            props.loading ? "Loading..." : EmptyCanvasMessage.top,
            textOptions
        );
    }, [props.loading]);

    const bottomText = useMemo(() => {
        const font = new FontLoader().parse(TitWeb);

        const textOptions = {
            font,
            size: 0.5,
            height: 0.1,
        };

        return new TextGeometry(EmptyCanvasMessage.bottom, textOptions);
    }, []);

    useFrame(({ clock }) => {
        const e = clock.getElapsedTime();

        textRef.current.position.y = 0.2 * Math.sin(e / 1.2);
        textRef.current.rotation.y = 0.05 * Math.sin(1.8 * e);
    });

    return (
        <>
            <ContactShadows
                position={[0, -4, 0]}
                opacity={0.4}
                width={10}
                height={10}
                blur={2}
                far={20}
            />
            <group ref={textRef}>
                <mesh geometry={topText} position={[-5, 1, 0]}>
                    <meshPhongMaterial attach="material" color={textColor} />
                </mesh>
                {!props.loading && (
                    <mesh geometry={bottomText} position={[-4.8, 0, 0]}>
                        <meshStandardMaterial
                            attach="material"
                            color={textColor}
                        />
                    </mesh>
                )}
            </group>
        </>
    );
};

export default EmptyCanvasText;
