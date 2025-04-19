import moment from "moment"
import path from 'path'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client'
import { error } from "./utils/custom_logs.js";
const prisma = new PrismaClient()

// pega a rota absoluta 
const __dirname = dirname(fileURLToPath(import.meta.url));


// verify if the time matches the timezone offset format
const isName = (time) => {
    if (time) return !/^[+-]\d{1,2}(:\d{0,2})?$/.test((time))
    return false
}

const formatTimezone = (timezone, toSearch=false) => {
    /*
    Formata o fuso horário para o formato correto => +00:00
    */
    if (timezone) {
        timezone = timezone?.trim().replace(',', ':').replace(/(?<=[+-])(?=\d(?=:|$))/, '0').replace(/:$/, ':00').replace(/(?<=[+-]\d{2}$)/, ':00')
        if (!toSearch) return timezone.replace(/:(\d)$/, ':$1' + '0')
        return timezone
    }
    return '+00:00'
}

// insert timestamp in database
const insertTimestamp = async (date_obj, used_timezone_query, aplicated_timezone_query) => {
    try {
        await prisma.timestamp.create({
            data: {
                searched_at: new Date(),
                date: {
                    create: {
                        date: date_obj,
                        used_timezone: used_timezone_query,
                        aplicated_timezone: aplicated_timezone_query
                    }
                }
            }
        })
    } catch (e) {
        error(e)
    }
}

// create querys and insert into timestamp table in database with aplicated timezone name
const insertTimestampTzName = async (date_obj, used_timezone, aplicated_timezone) => {
    // used_timezone foreign key
    const used_timezone_query = {
        connectOrCreate: {
            where:{
                name: 'etc/gmt' + used_timezone
            },
            create: {
                name: 'etc/gmt' + used_timezone,
                utc_offset: used_timezone
            }
        }
    }

    // aplicated_timezone foreign key
    const aplicated_timezone_query = {
        connect: {
            name: aplicated_timezone
        }
    }

    // register timestamp
    await insertTimestamp(date_obj, used_timezone_query, aplicated_timezone_query)
}

// create querys and insert into timestamp table in database with aplicated timezone time
const insertTimestampTzTime = async (date_obj, used_timezone, aplicated_timezone) => {
    // aplicated_timezone foreign key
    const aplicated_timezone_offset = aplicated_timezone ? aplicated_timezone : '+00:00'
    const aplicated_timezone_name = 'etc/gmt' + aplicated_timezone_offset
    const aplicated_timezone_query = {
        connectOrCreate: {
            where: {
                name: aplicated_timezone_name
            },
            create: {
                name: aplicated_timezone_name,
                utc_offset: aplicated_timezone_offset
            }
        }
    }

    // used_timezone foreign key
    const used_timezone_name = 'etc/gmt' + used_timezone
    const used_timezone_query = {
        connectOrCreate: {
            where: {
                name: used_timezone_name
            },
            create: {
                name: used_timezone_name,
                utc_offset: used_timezone
            }
        }
    }
    
    // register timestamp
    await insertTimestamp(date_obj, used_timezone_query, aplicated_timezone_query)
}

// select timezone offset from database by timezone name
const selectUtcOffset = async (timezone_name) => {
    const timezone_obj = await prisma.timezone.findFirst({
        where: {
            name: timezone_name
        },
        select: {
            utc_offset: true
        }
    })
    if (timezone_obj) return timezone_obj.utc_offset
}

const createDateObj = (dateTime) => {
    // se o parametro date não existir, utiza o tempo atual
    if (!dateTime) return new Date()
    
    // se o parametro dateTime esteja em unix, converte para o tipo Number ao criar o objeto Date
    return new Date(!isNaN(dateTime) ? Number(dateTime) : dateTime)
}

// apply timezone to a Date object
export const applyTimezone = (date, timezone_string) => {
    const splited_timezone = timezone_string.trim().split(':')
    const hours = Number(splited_timezone[0])
    const minutes = Number(splited_timezone[1])

    // Ajusta o fuso horário
    date.setUTCHours(date.getUTCHours() + hours, date.getUTCMinutes() + minutes)
    return date
}

export const getMainPage = (req, res) => res.sendFile(path.join(__dirname, 'templates', 'index.html'))

export const getDate = async (req, res) => {
    const date_param = req.params.date
    const aplicated_timezone = req.query.timezone
    
    // create date object without timezone
    const date_obj_without_tz = createDateObj(date_param)

    if(isNaN(date_obj_without_tz.getTime())) return res.json({ error: "Invalid Date" })
    
    // get used timezone from date parameter and format it
    const raw_used_timezone = date_param?.match(/(?<=GMT)[+-]\d{1,2}(:\d{0,2})?$/)
    const used_timezone = formatTimezone(raw_used_timezone ? raw_used_timezone[0]: undefined)
    
    // sets utc_offset
    // If timezone is a name, get the timezone offset from the database; otherwise, use the provided timezone
    let utc_offset
    if (isName(aplicated_timezone)) {
        // register timestamp into database
        await insertTimestampTzName(date_obj_without_tz, used_timezone, aplicated_timezone)
        utc_offset = await selectUtcOffset(aplicated_timezone)
    
        // returns error message if timezone was not found in database
        if (!utc_offset) return res.json({ error: "Invalid timezone_name" })
    }
    else {
        const aplicated_timezone_offset = formatTimezone(aplicated_timezone)
        
        // register timestamp into database
        await insertTimestampTzTime(date_obj_without_tz, used_timezone, aplicated_timezone_offset)
        utc_offset = formatTimezone(aplicated_timezone_offset)
    }

    // Clone date object to avoid applying timezone
    const date_obj_with_tz = applyTimezone(structuredClone(date_obj_without_tz), utc_offset)
    
    // transforma o tempo em utc e unix
    const unix = date_obj_with_tz.getTime()
    const utc = date_obj_with_tz.toUTCString() + (utc_offset && !utc_offset.includes('00:00') ? ` ${utc_offset}` : '')

    res.json({ unix, utc })
}
 
// retorna a diferença entre as datas
export const getDateDiff = (req, res) => {
    const starts = moment(createDateObj(req.params.date1))
    const ends = moment(createDateObj(req.params.date2))

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
    
    query.map((item, index) => {
        // Se o item for uma hora, fromata para o formato correto
        if (item.match(/^[+-]?\d{1,2}[:,]?\d{0,2}$/)) {
            query[index] = formatTimezone(item, true)
        }
    })
    
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