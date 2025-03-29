import { useState } from "react";
import ShowTime from "../ShowTime.tsx";
import TimeStampForm from "./TimeStampForm";

const TimeStamp = () => {
    const [utc, setUtc] = useState('')
    const [unix, setUnix] = useState('')
    const [withTimezone, setWithTimezone] = useState('')

    const handleSubmit = async (dataInput: string, timezoneInput: string) => {
        const params = new URLSearchParams();
        params.append('timezone', timezoneInput || 'UTC');

        const response = await fetch(`http://127.0.0.1:3000/api/${dataInput || ""}?` + params.toString(), {
            method: 'GET',
        });

        const data = await response.json()
        setUtc(data.utc)
        setUnix(data.unix)
        setWithTimezone(data.formatedTime)
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
