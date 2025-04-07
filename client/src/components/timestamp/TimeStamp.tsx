import { useState } from "react";
import ShowTime from "../ShowTime.tsx";
import TimeStampForm from "./TimeStampForm";
import fetchHandler from "../../utils/fetchHandler.ts";

const TimeStamp = () => {
    const [utc, setUtc] = useState('')
    const [unix, setUnix] = useState('')

    const handleSubmit = async (dataInput: string, timezoneInput: string) => {
        const okFunc = ({data}: any) => {
            setUtc(data.utc)
            setUnix(data.unix)
        }

        const params = new URLSearchParams();
        const tzParam = timezoneInput.split(' ')[1] ? timezoneInput.split(' ')[1] : timezoneInput
        params.append('timezone', tzParam);

        fetchHandler(`api/${dataInput || ''}?${params.toString()}`, 'GET', okFunc)
    };

    return (
        <section className="timestamp">
            <h1>Timestamp</h1>
            <TimeStampForm onSubmit={handleSubmit} />
            <section className="timestamp_result">
                <ShowTime label="UTC" content={utc}></ShowTime>
                <ShowTime label="UNIX" content={unix}></ShowTime>
            </section>
        </section>
        
    );
};

export default TimeStamp;
