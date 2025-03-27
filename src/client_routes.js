import { __dirname } from "./server.js"
import moment from "moment"
import path from 'path'

const dateHandler = (time) => {
    // se o parametro date não existir, utiza o tempo atual
    if (!time) return new Date()

    // converte a data para o tipo Number caso esteja em unix
    const date = !isNaN(time) ? Number(time) : time
    return new Date(date)
}

export const getMainPage = (req, res) => res.sendFile(path.join(__dirname, 'templates', 'index.html'))

export const getData = (req, res) => {
    const time = dateHandler(req.params.date)

    // tempo ajustado ao fuso horário
    const formatedTime = time.toLocaleString('pt-BR', { timeZone: req.query.timezone })

    // transforma o tempo em utc e unix
    const unix = time.getTime()
    const utc = time.toUTCString()
    
    // retorna erro caso a data seja inválida
    if (isNaN(unix)) return res.json({ error: "Invalid Date" })

    res.json({ unix, utc, formatedTime })
}

// retorna a diferença entre as datas
export const getDateDiff = (req, res) => {
    const starts = moment(dateHandler(req.params.date1))
    const ends = moment(dateHandler(req.params.date2))

    // calcula a diferença em anos, meses, dias, horas, minutos, segundos e milisegundos
    const years = ends.diff(starts, 'year');
    starts.add(years, 'years');
    const months = ends.diff(starts, 'months');
    starts.add(months, 'months');
    const days = ends.diff(starts, 'days');
    starts.add(days, 'days')
    const hours = ends.diff(starts, 'hours')
    starts.add(hours, 'hours')
    const minutes = ends.diff(starts, 'minutes')
    starts.add(minutes, 'minutes')
    const seconds = ends.diff(starts, 'seconds')
    starts.add(seconds, 'seconds')
    const milliseconds = ends.diff(starts, 'milliseconds')

    // converte os tempos para positivo caso sejam negativos
    const diff = {years, months, days, hours, minutes, seconds, milliseconds}
    Object.keys(diff).forEach(key => diff[key] = Math.abs(diff[key]) );

    res.json(diff)
}