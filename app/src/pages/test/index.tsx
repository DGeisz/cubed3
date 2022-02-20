import { NextPage } from "next";
import React, { useState } from "react";
import clsx from "clsx";
import axios from "axios";
import { useProvider } from "../../lib/service_providers/provider_provider";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
    buyCanvas,
    getDefaultAddresses,
    initializeCubed,
} from "../../global_chain/chain_methods";
import * as anchor from "@project-serum/anchor";
import { CANVAS_SEED } from "../../global_chain/chain_constants";
import { useWallet } from "@solana/wallet-adapter-react";

const BASE_URL = "http://localhost:4000";

export interface CubePlacement {
    created: boolean;
    algo: number[];
    x: number;
    y: number;
}

const TestPage: NextPage = () => {
    const { program, provider } = useProvider();

    const [canvasTime, setCanvasTime] = useState<number>(0);

    const a = Buffer.from("hello", "utf-8");

    const wallet = useWallet();

    console.log("this is buffer", a);

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

    async function buyCanvasMeth() {
        const time = await buyCanvas(provider, program);

        const res = await axios.post(`${BASE_URL}/buy_canvas`, {
            time,
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

    async function checkUpdate() {
        const p: CubePlacement = {
            algo: [1, 2, 3],
            x: 1,
            y: 2,
            created: true,
        };

        if (wallet.signMessage) {
            const msg = Buffer.from(JSON.stringify(p), "utf-8");

            const sig = await wallet.signMessage(msg);

            console.log("sig", msg, sig);

            const res = await axios.post(`${BASE_URL}/queue_canvas_update`, {
                time: canvasTime,
                signature: sig,
                cubePlacement: p,
            });

            console.log("res", res);
        }
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

    return (
        <div className={clsx("h-screen w-screen bg-white p-8")}>
            <div className={clsx("flex flex-row")}>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white",
                        "cursor-pointer"
                    )}
                    onClick={callCreateUser}
                >
                    Create User
                </div>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white cursor-pointer"
                    )}
                    onClick={callGetUser}
                >
                    Get User
                </div>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white cursor-pointer"
                    )}
                    onClick={init}
                >
                    Init
                </div>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white cursor-pointer"
                    )}
                    onClick={buyCanvasMeth}
                >
                    Buy Canvas
                </div>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white cursor-pointer"
                    )}
                    onClick={getCanvasInfo}
                >
                    Get Canvas
                </div>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white cursor-pointer"
                    )}
                    onClick={getCanvasInfoLocal}
                >
                    Get Canvas Local
                </div>
                <div
                    className={clsx(
                        "bg-cyan-600 font-bold rounded shadow-sm mr-4 p-2 text-white cursor-pointer"
                    )}
                    onClick={checkUpdate}
                >
                    Check Update
                </div>
            </div>
            <div>{canvasTime}</div>
        </div>
    );
};

export default TestPage;
