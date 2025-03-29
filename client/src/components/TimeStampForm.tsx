import { useState } from "react";

const TimeStampForm = ({onSubmit}: { onSubmit: (dataInput: string, timezoneInput: string) => void}) => {
    const [dataInput, setDataInput] = useState("");
    const [timezoneInput, setTimezoneInput] = useState("UTC");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(dataInput, timezoneInput)
    }

    return(
        <form id="time-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="data-input">Data em Unix ou UTC: </label>
                    <input
                        id="data-input"
                        type="text"
                        value={dataInput}
                        onChange={(e) => setDataInput(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="timezone-input">Diga o timezone: </label>
                    <input
                        id="timezone-input"
                        type="text"
                        placeholder="UTC"
                        value={timezoneInput}
                        onChange={(e) => setTimezoneInput(e.target.value)}
                    />
                </div>
                <button type="submit">Enviar</button>
            </form>
    )
}

export default TimeStampForm