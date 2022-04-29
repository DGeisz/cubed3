import { NextPage } from "next";
import React, { useState } from "react";
import clsx from "clsx";
import axios from "axios";
import { useProvider } from "../../lib/service_providers/provider_provider";
import { PublicKey } from "@solana/web3.js";
import {
    buyCanvas,
    initializeCubed,
    placeCube,
} from "../../global_chain/chain_methods";
import * as anchor from "@project-serum/anchor";
import {
    CANVAS_SEED,
    DEFAULT_COLLECTION_NAME,
} from "../../global_chain/chain_constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { CubePlacement } from "../../global_architecture/cube_model/cube_model";
import { BASE_URL } from "../../global_networking/constants";

const TestPage: NextPage = () => {
    const { program, provider } = useProvider();

    const [canvasTime, setCanvasTime] = useState<number>(0);

    const a = Buffer.from("hello", "utf-8");

    const wallet = useWallet();

    const callCreateUser = async () => {
        const res = await axios.post(`${BASE_URL}/create_user`, {
            name: "Danny",
            health: 400,
        });

        console.log("called", res.data);
    };

    async function init() {
        await initializeCubed(provider, program);
    }

    async function deleteEverything() {
        await axios.post(`${BASE_URL}/delete_everything`);
    }

    async function buyCanvasMeth() {
        const time = await buyCanvas(provider, program);

        const res = await axios.post(`${BASE_URL}/buy_canvas`, {
            time,
            collectionName: DEFAULT_COLLECTION_NAME,
        });

        console.log("finished", res.data);

        setCanvasTime(time);
    }

    async function getCanvasInfo() {
        const res = await axios.post(`${BASE_URL}/get_canvas`, {
            time: canvasTime,
        });

        console.log("canvas time", JSON.stringify(res.data, undefined, 2));
    }

    async function allCanvases() {
        const res = await axios.post(`${BASE_URL}/all_canvases`);

        console.log("all canvases", JSON.stringify(res.data, undefined, 2));
    }

    async function placeCubeFullMeth() {
        const p: CubePlacement = {
            algo: [1, 2, 3],
            x: 1,
            y: 2,
            created: true,
        };

        if (wallet.signMessage) {
            /* Start off by expressing intent to the server */

            const msg = Buffer.from(JSON.stringify(p), "utf-8");
            const sig = await wallet.signMessage(msg);

            const res = await axios.post(`${BASE_URL}/queue_canvas_update`, {
                time: canvasTime,
                signature: sig,
                cubePlacement: p,
            });

            console.log("res", res);

            /* Now send the actual placement request to the chain */
            await placeCube(provider, program, canvasTime, p.algo, p.x, p.y);

            const finalRes = await axios.post(
                `${BASE_URL}/finalize_canvas_update`,
                {
                    time: canvasTime,
                }
            );
        }
    }

    async function finalizePlacement() {
        const finalRes = await axios.post(
            `${BASE_URL}/finalize_canvas_update`,
            {
                time: canvasTime,
            }
        );

        console.log("finalRes", finalRes);
    }

    async function getCanvasInfoLocal() {
        const canvas_time_bn = new anchor.BN(canvasTime);
        const canvas_time_buffer = canvas_time_bn.toArrayLike(Buffer, "le", 8);

        const [canvas_pda] = await PublicKey.findProgramAddress(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)),
                canvas_time_buffer,
            ],
            program.programId
        );

        const canvas = await program.account.cubedCanvas.fetch(canvas_pda);

        console.log("canvas", canvas);
    }

    const callGetUser = async () => {
        const res = await axios.post(`${BASE_URL}/get_user`, {
            name: "Danny",
        });

        console.log("get user", res.data);
    };

    const OptButton: React.FC<{ onClick: () => void | Promise<void> }> = (
        props
    ) => {
        return (
            <div
                className={clsx(
                    "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white",
                    "cursor-pointer mb-4"
                )}
                onClick={props.onClick}
            >
                {props.children}
            </div>
        );
    };

    return (
        <div className={clsx("h-screen w-screen bg-white p-8")}>
            <div className={clsx("flex flex-row flex-wrap")}>
                <OptButton onClick={callCreateUser}>Create User</OptButton>
                <OptButton onClick={callGetUser}>Get User</OptButton>
                <OptButton onClick={init}>Init</OptButton>
                <OptButton onClick={buyCanvasMeth}>Buy Canvas</OptButton>
                <OptButton onClick={getCanvasInfo}>Get Canvas</OptButton>
                <OptButton onClick={allCanvases}>All Canvases</OptButton>
                <OptButton onClick={getCanvasInfoLocal}>
                    Get Canvas Local
                </OptButton>
                <OptButton onClick={placeCubeFullMeth}>Place Cube</OptButton>
                <OptButton onClick={finalizePlacement}>Finalize Cube</OptButton>
                <OptButton onClick={deleteEverything}>
                    Delete Everything
                </OptButton>
            </div>
            <div>{canvasTime}</div>
        </div>
    );
};

export default TestPage;
