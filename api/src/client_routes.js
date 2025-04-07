import moment from "moment"
import path from 'path'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// pega a rota absoluta 
const __dirname = dirname(fileURLToPath(import.meta.url));

const formatTimezone = (timezone) => timezone?.trim()
                                    .replace(',', ':')
                                    .replace(/(?<=[+-])(?=\d(?=:|$))/, '0')
                                    .replace(/:(\d)$/, ':$1' + '0')
                                    .replace(/:$/, ':00')
                                    .replace(/(?<=[+-]\d{2}$)/, ':00')
 
export const dateHandler = (time, timezone_string='0') => {
    const splited_timezone = timezone_string.trim().split(':')
    const hours = Number(splited_timezone[0])
    const minutes = Number(splited_timezone[1])

    let date

    // se o parametro date não existir, utiza o tempo atual
    if (!time) date = new Date()

    // Ao criar, converte a data para o tipo Number caso esteja em unix
    else date = new Date(!isNaN(time) ? Number(time) : time)
    
    // Ajusta o fuso horário
    if (timezone_string != 0) date.setUTCHours(date.getUTCHours() + hours, date.getUTCMinutes() + minutes)
    return date
}

export const getMainPage = (req, res) => res.sendFile(path.join(__dirname, 'templates', 'index.html'))

export const getDate = (req, res) => {
    const timezone = formatTimezone(req.query.timezone)
    const time = dateHandler(req.params.date, timezone)

    // transforma o tempo em utc e unix
    const unix = time.getTime()
    const utc = time.toUTCString() + (timezone && timezone != 0 ? ` ${timezone}` : '')
    
    // retorna erro caso a data seja inválida
    if (isNaN(unix)) return res.json({ error: "Invalid Date" })

    res.json({ unix, utc })
}
 
// retorna a diferença entre as datas
export const getDateDiff = (req, res) => {
    const starts = moment(dateHandler(req.params.date1))
    const ends = moment(dateHandler(req.params.date2))

    // calcula a diferença em dias, horas, minutos e segundos
    const days = ends.diff(starts, 'days');
    starts.add(days, 'days')
    const hours = ends.diff(starts, 'hours')
    starts.add(hours, 'hours')
    const minutes = ends.diff(starts, 'minutes')
    starts.add(minutes, 'minutes')
    const seconds = ends.diff(starts, 'seconds')

    // Transforma todos os tempos em valores positivos
    const diff = {days, hours, minutes, seconds}
    Object.keys(diff).forEach(key => diff[key] = Math.abs(diff[key]) );

    res.json(diff)
}

export const searchTimezone = async (req, res) => {
    let query = req.query.q?.split(' ')
    
    query.map((item, index) => {
        // Se o item for uma hora, fromata para o formato correto
        if (item.match(/^[+-]?\d{1,2}[:,]?\d{0,2}$/)) {
            query[index] = formatTimezone(item)
        }
    })


    // Se não houver query, retorna 10 fusos horários distintos
    if (!query) {
        return res.json(await prisma.timezone.findMany({
            distinct: ['utc_offset'],
            select: {
                name: true,
                utc_offset: true,
                country_code: true,
            }
        }))         
    }

    const queryConditions = query.map((item) => item ? ({
        OR: [
            { name: { contains: item } },
            { country_code: { contains: item } },
            { utc_offset: { contains: item } },
        ]
    }) : null) // Retorna `null` se `item` for inválido
    .filter(Boolean); // Remove `null` e `undefined`
    
    res.json(await prisma.timezone.findMany({
        where: {
            AND: queryConditions
        },
        select: {
            name: true,
            utc_offset: true,
            country_code: true,
        },
        take: 10,
    }))
}