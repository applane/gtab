import { useEffect, useCallback } from "react";

function usePlayToggle(playPause) {
    const onKey = useCallback((e) => {
        const tag = document.activeElement?.tagName;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;

        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            playPause();
        }
    },
        [playPause]
    );

    useEffect(() => {
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onKey]);
}

export default usePlayToggle;
