import { useState } from "react";
import ShowTime from "../ShowTime.tsx";
import TimeStampForm from "./TimeStampForm";
import fetchHandler from "../../utils/fetchHandler.ts";

const TimeStamp = () => {
    const [utc, setUtc] = useState('')
    const [unix, setUnix] = useState('')
    const [withTimezone, setWithTimezone] = useState('')

    const handleSubmit = async (dataInput: string, timezoneInput: string) => {
        const okFunc = ({data}: any) => {
            setUtc(data.utc)
            setUnix(data.unix)
            setWithTimezone(data.formatedTime)
        }

        const params = new URLSearchParams();
        params.append('timezone', timezoneInput || 'UTC');

        fetchHandler(`api/${dataInput || ''}?${params.toString()}`, 'GET', okFunc)
    };

    return (
        <section>
            <TimeStampForm onSubmit={handleSubmit} />
            <section>
                <h2>Tempos</h2>
                <ShowTime label="UTC" content={utc}></ShowTime>
                <ShowTime label="UNIX" content={unix}></ShowTime>
                <ShowTime label="Com timezone" content={withTimezone}></ShowTime>
            </section>
        </section>
        
    );
};

export default TimeStamp;
