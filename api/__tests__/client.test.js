import request from 'supertest'
import App from '../src/app'
import { expect, jest } from '@jest/globals';
import fs from "fs";
import path from "path";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client'
import moment from 'moment';
import database from '../src/database.js'

const prisma = new PrismaClient()

const mockInsertTimestampAplTzTime = jest.fn()
const mockInsertTimestampAplTzName = jest.fn()
const mockInsertTimestamp = jest.fn()

const formatToParams = (param) => param.replace(' ', '%20')

describe("Function's tests", () => {
    it('Should save timestamp data into database with timezone name', async () => {
        mockInsertTimestamp.mockClear()

        const date_param = 'Sun, 13 Mar 2022 17:10:07 GMT'
        const date_obj = new Date(date_param)
        const used_timezone = '+00:00'
        const aplicated_timezone = 'America/Belem'

        database.insertTimestampAplTzName(date_obj, used_timezone, aplicated_timezone, mockInsertTimestamp)

        const expected_used_timezone_query = {
            connectOrCreate: {
                where: {
                    name: 'etc/gmt' + used_timezone
                },
                create: {
                    name: 'etc/gmt' + used_timezone,
                    utc_offset: used_timezone
                }
            }
        }
        const expected_aplicated_timezone_query = {
            connect: {
                name: aplicated_timezone
            }
        }

        expect(mockInsertTimestamp.mock.calls).toHaveLength(1)                                              // check mockInsertTimestamp was called once
        expect(mockInsertTimestamp.mock.calls[0][0].toUTCString()).toBe('Sun, 13 Mar 2022 17:10:07 GMT')    // check date parameter 
        expect(mockInsertTimestamp.mock.calls[0][1]).toEqual(expected_used_timezone_query)                  // check used_timezone parameter
        expect(mockInsertTimestamp.mock.calls[0][2]).toEqual(expected_aplicated_timezone_query)             // check aplicated_timezone parameter
    })

    it('Should save timestamp data into database with timezone time', async () => {
        mockInsertTimestamp.mockClear()

        const date_param = 'Sun, 13 Mar 2022 17:10:07 GMT'
        const date_obj = new Date(date_param)
        const used_timezone = '+00:00'
        const aplicated_timezone = '+03:00'

        database.insertTimestampAplTzTime(date_obj, used_timezone, aplicated_timezone, mockInsertTimestamp)

        const expected_used_timezone_query = {
            connectOrCreate: {
                where: {
                    name: 'etc/gmt' + used_timezone
                },
                create: {
                    name: 'etc/gmt' + used_timezone,
                    utc_offset: used_timezone
                }
        }
        }
        const expected_aplicated_timezone_query = {
            connectOrCreate: {
                where: {
                    name: 'etc/gmt' + aplicated_timezone
                },
                create: {
                    name: 'etc/gmt' + aplicated_timezone,
                    utc_offset: aplicated_timezone
                }
            }
        }

        expect(mockInsertTimestamp.mock.calls).toHaveLength(1)                                   // check mockInsertTimestamp was called once
        expect(mockInsertTimestamp.mock.calls[0][0].toUTCString()).toBe(date_param)              // check date parameter
        expect(mockInsertTimestamp.mock.calls[0][1]).toEqual(expected_used_timezone_query)       // check used_timezone parameter
        expect(mockInsertTimestamp.mock.calls[0][2]).toEqual(expected_aplicated_timezone_query)  // check aplicated_timezone parameter
    })
})

describe('Test routes', () => {
    const app = new App({
        ...database,
        insertTimestampAplTzTime: mockInsertTimestampAplTzTime,
        insertTimestampAplTzName: mockInsertTimestampAplTzName,
    }, true).app

    test('/ route', async () => {
        const response = await request(app).get('/')
        expect(response.status).toBe(200)
        
        // Verifica se o HTML recebido está correto
        const __dirname = dirname(fileURLToPath(import.meta.url));
        expect(response.text).toEqual(fs.readFileSync(path.join(__dirname, '../src/templates/index.html'), 'utf8'))
    })

    describe('/api/ route', () => {
        let response
        let expectedResponse = {
            utc: 'Sun, 30 Mar 2025 19:13:57 GMT',
            unix: 1743362037000,
        }

        test('Send unxi data', async () => {
            response = await request(app).get('/api/1743362037000')
            expect(response.body).toEqual(expectedResponse)
        })
        
        test('Send Utc data', async () => {
            response = await request(app).get('/api/Sun,%2030%20Mar%202025%2019:13:57%20GMT')
            expect(response.body).toEqual(expectedResponse)
        })

        test('Send Utc data with timezone', async () => {
            const expectedResponse = {
                unix: 1743362037000,
                utc: 'Sun, 30 Mar 2025 19:13:57 GMT -03:00'
            }
            response = await request(app).get('/api/Sun,%2030%20Mar%202025%2022:13:57%20GMT?timezone=-3')
            expect(response.body).toEqual(expectedResponse)
        })

        test('Send without data', async () => {
            const date = new Date()
            response = await request(app).get('/api/')

            const expected_moment = moment(date)
            const received_moment_utc = moment(response.body.utc)
            const received_moment_unix = moment(response.body.unix)
            
            // O teste pode falhar se o tempo de resposta do endpoint for igual ou maior que 1 segundo.
            expect(received_moment_utc.diff(expected_moment, 'seconds')).toBe(0)
            expect(received_moment_unix.diff(expected_moment, 'seconds')).toBe(0)

        })

        it('Should save date in database without used timezone and aplicated timezone', async () => {
            mockInsertTimestampAplTzTime.mockClear()
            
            const date_param = 'Sun, 30 Mar 2025 20:30:27 GMT'

            await request(app).get('/api/'+ formatToParams(date_param))
            
            expect(mockInsertTimestampAplTzTime.mock.calls).toHaveLength(1)                        // check if the function was called just once
            expect(mockInsertTimestampAplTzTime.mock.calls[0][0].toUTCString()).toBe(date_param)   // check if the function was called with the correct date object
            expect(mockInsertTimestampAplTzTime.mock.calls[0][1]).toBe('+00:00')                   // check if the function was called with the correct used timezone
            expect(mockInsertTimestampAplTzTime.mock.calls[0][2]).toBe('+00:00')                   // check if the function was called with the correct aplicated timezone
        })

        it('Should save date and used timezone in the database', async () => {
            mockInsertTimestampAplTzTime.mockClear()

            const date_param = 'Sun, 30 Mar 2025 20:30:27 GMT+3'
            const raw_date = new Date(date_param).toUTCString()

            await request(app).get('/api/' + formatToParams(date_param))

            expect(mockInsertTimestampAplTzTime.mock.calls).toHaveLength(1)                        // check if the function was called just once
            expect(mockInsertTimestampAplTzTime.mock.calls[0][0].toUTCString()).toBe(raw_date)     // check if the function was called with the correct date object
            expect(mockInsertTimestampAplTzTime.mock.calls[0][1]).toBe('+03:00')                   // check if the function was called with the correct used timezone
            expect(mockInsertTimestampAplTzTime.mock.calls[0][2]).toBe('+00:00')                   // check if the function was called with the correct aplicated timezone
        })

        it('Should save date and timezone in the database, by sending timezone name', async () => {
            mockInsertTimestampAplTzName.mockClear()

            const date_param = 'Sun, 30 Mar 2025 12:13:57 GMT+3'
            const raw_date = new Date(date_param).toUTCString()
            const aplicated_timezone_name = 'America/Belem'

            const response = await request(app).get('/api/' + formatToParams(date_param) + '?timezone=' + aplicated_timezone_name)
            
            expect(response.body).not.toEqual({ error: "Invalid timezone_name" })
            expect(mockInsertTimestampAplTzName.mock.calls).toHaveLength(1)                        // check if the function was called just once
            expect(mockInsertTimestampAplTzName.mock.calls[0][0].toUTCString()).toBe(raw_date)     // check if the function was called with the correct date object
            expect(mockInsertTimestampAplTzName.mock.calls[0][1]).toBe('+03:00')                   // check if the function was called with the correct used timezone
            expect(mockInsertTimestampAplTzName.mock.calls[0][2]).toBe(aplicated_timezone_name)   // check if the function was called with the correct aplicated timezone
        })

        test('Send invalid data', async () => {
            const expectedResponse = { error: "Invalid Date" }
            response = await request(app).get('/api/aaaa')
            expect(response.body).toEqual(expectedResponse)
        })

        test('Send invalid timezone name', async () => {
            const expectedResponse = { error: "Invalid timezone_name" }
            response = await request(app).get('/api/Sun,%2030%20Mar%202025%2019:13:57%20GMT+3?timezone=aaaa')
            expect(response.body).toEqual(expectedResponse)
        })
    })
    
    describe('/api/diff/ route', () => {
        let expectedResponse = {
            days: 115,
            hours: 17,
            minutes: 46,
            seconds: 40,
        }
        test('Send two Unix data', async () => {
            const response = await request(app).get('/api/diff/1743362037000/1753362037000')
            expect(response.body).toEqual(expectedResponse)
        })

        test('Send two Utc data', async () => {
            const response = await request(app).get('/api/diff/Sun,%2030%20Mar%202025%2019:13:57%20GMT/Thu,%2024%20Jul%202025%2013:00:37%20GMT')
            expect(response.body).toEqual(expectedResponse)
        })
    })

    describe('/search_timezone/ route', () => {
        test('Search timezone without query', async () => {
            let expectedResponse = await prisma.timezone.findMany({
                distinct: ['utc_offset'],
                select: {
                    name: true,
                    utc_offset: true,
                    country_code: true,
                }
            })
            const response = await request(app).get('/search_timezone')
            expect(response.body).toEqual(expectedResponse)
        })

        test('Search timezone with query', async () => {
            let expectedResponse = await prisma.timezone.findMany({
                where: {
                    OR: [
                        { name: { contains: 'America' } },
                        { country_code: { contains: 'America' } },
                        { utc_offset: { contains: 'America' } },
                    ]
                },
                select: {
                    name: true,
                    utc_offset: true,
                    country_code: true,
                },
                take: 10,
            })
            const response = await request(app).get('/search_timezone?q=America')
            expect(response.body).toEqual(expectedResponse)
        })
    })
})