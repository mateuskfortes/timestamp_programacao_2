import { useState } from "react"

const TimeDiffForm = ({onSubmit}: {onSubmit: (date1: string, date2: string) => void}) => {
    const [ date1, setDate1 ] = useState('')
    const [ date2, setDate2 ] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(date1, date2)
    }

    return (
        <form id="diff-form" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="date1">primeira data: </label>
                <input 
                    id="date1" 
                    type="text" 
                    onChange={(e) => setDate1(e.target.value)}/>
            </div>
            <div>
                <label htmlFor="date2">segunda data: </label>
                <input 
                    id="date2" 
                    type="text" 
                    onChange={(e) => setDate2(e.target.value)}/>
            </div>
            <button type="submit">comparar</button>
        </form>
    )
}

export default TimeDiffForm