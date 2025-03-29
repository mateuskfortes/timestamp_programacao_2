import { useState } from "react"
import TimeDiffForm from "./TimeDiffForm"
import ShowTime from "../ShowTime"

const TimeDiff = () => {
    const [ days, setDays ] = useState('')
    const [ hours, setHours ] = useState('')
    const [ minutes, setMinutes ] = useState('')
    const [ seconds, setSeconds ] = useState('')

    const handleSubmit = async (date1: string, date2: string) => {
        const response = await fetch(`http://localhost:3000/api/diff/${date1}/${date2}`)

        const data = await response.json()

        setDays(data.days)
        setHours(data.hours)
        setMinutes(data.minutes)
        setSeconds(data.seconds)
    }

    return (
        <section>
            <h1>Diferença entre datas</h1>
            <TimeDiffForm onSubmit={handleSubmit}/>
            <div>
                <ShowTime label="dias" content={days} />
                <ShowTime label="horas" content={hours } />
                <ShowTime label="minutos" content={minutes} />
                <ShowTime label="segundos" content={seconds} />
            </div>
        </section>
    )
}

export default TimeDiff