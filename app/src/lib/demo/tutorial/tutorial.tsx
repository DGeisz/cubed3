import clsx from "clsx";
import React, { useState } from "react";
import Modal from "../../../global_building_blocks/modal/model";
import { gradientText, pinkToPurple } from "../../landing_styles";

const DemoTutorial: React.FC = () => {
    const [v, setV] = useState<boolean>(true);
    return (
        <Modal visible={v} setVisible={setV}>
            <p className="font-semibold">
                Watch this video to learn how to use Cubed!
            </p>
        </Modal>
    );
};

export default DemoTutorial;
