import { useState } from "react";

const TimeStampForm = ({onSubmit}: { onSubmit: (dataInput: string, timezoneInput: string) => void}) => {
    const [dataInput, setDataInput] = useState("");
    const [timezoneInput, setTimezoneInput] = useState("0");

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
                    <label htmlFor="timezone-input">Para o fuso horário: </label>
                    
                    <select 
                        id="timezone-input"
                        value={timezoneInput}
                        onChange={(e) => setTimezoneInput(e.target.value)}
                        >
                        { 
                            Array.from({length: 12}, (_, i) => i - 12).map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))
                        }
                        {
                            Array.from({length: 13}, (_, i) => i).map((value) => (
                                <option key={value} value={'+' + value}>{'+' + value}</option>
                            ))
                        }
                    </select>
                </div>
                <button type="submit">DESCOBRIR</button>
            </form>
    )
}

export default TimeStampForm