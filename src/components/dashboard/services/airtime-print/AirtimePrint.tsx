import { useEffect } from "react";
import useAirtimePrintStore from "@/stores/useAirtimePrintStore";
import SelectProvider from "./SelectProvider";
import Checkout from "./Checkout";
import Receipt from "./Receipt";

const AirtimePrint = () => {
    const { step, reset } = useAirtimePrintStore();

    useEffect(() => {
        reset();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const AirtimePrintSteps = [
        { id: 1, component: SelectProvider },
        { id: 2, component: Checkout },
        { id: 3, component: Receipt },
    ];

    const CurrentComponent = AirtimePrintSteps[step - 1]?.component || AirtimePrintSteps[0].component;

    return (
        <div className="min-h-[80vh] flex md:items-center justify-center pt-5 md:pt-0">
            <CurrentComponent />
        </div>
    );
};

export default AirtimePrint;
