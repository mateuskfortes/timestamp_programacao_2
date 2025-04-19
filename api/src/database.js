import { PrismaClient } from '@prisma/client';
import { error } from "./utils/custom_logs.js";
const prisma = new PrismaClient()

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


export default {
    insertTimestamp,
    insertTimestampTzName,
    insertTimestampTzTime,
    selectUtcOffset
}