import { useRegisterSW } from 'virtual:pwa-register/react';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

function ReloadPrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    const close = useCallback(() => {
        setNeedRefresh(false);
    }, [setNeedRefresh]);

    useEffect(() => {
        if (needRefresh) {
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <span>New content available, click on reload button to update.</span>
                    <div className="flex gap-2">
                        <button
                            className="bg-primary-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => updateServiceWorker(true)}
                        >
                            Reload
                        </button>
                        <button
                            className="border border-gray-300 px-3 py-1 rounded text-sm"
                            onClick={() => {
                                close();
                                toast.dismiss(t.id);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), { duration: Infinity });
        }
    }, [needRefresh, updateServiceWorker, close]);

    return null;
}

export default ReloadPrompt;
