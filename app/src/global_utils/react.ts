import { useState } from "react";

export function useForceRerender() {
    const [_, setI] = useState<number>(0);

    return () => setI((i) => i + 1);
}
