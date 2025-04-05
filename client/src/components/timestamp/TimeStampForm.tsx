import { useState } from "react";
import SearchBar from "./SearchBar";

const TimeStampForm = ({onSubmit}: { onSubmit: (dataInput: string, timezoneInput: string) => void}) => {
    const [dataInput, setDataInput] = useState("");
    const [timezoneInput, setTimezoneInput] = useState("");

    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(dataInput, timezoneInput)
    }

    return(
        <form id="time-form" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="data-input">Data em Unix ou UTC: </label>
                <div className="date_input">
                    <input
                        id="data-input"
                        type="text"
                        value={dataInput}
                        onChange={(e) => setDataInput(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="timezone-input">Aplicar o fuso horário: </label>
                <SearchBar timezone={timezoneInput} setTZ={setTimezoneInput}/>
            </div>
            <button type="submit">DESCOBRIR</button>
        </form>
    )
}

export default TimeStampForm