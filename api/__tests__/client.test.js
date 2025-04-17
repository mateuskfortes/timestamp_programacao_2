import request from 'supertest'
import App from '../src/app'
import { dateHandler } from '../src/client_routes.js'
import fs from "fs";
import path from "path";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Test functions', () => {
    test('Date object creation with Unix time', () => {
        expect(dateHandler('111')).toEqual(new Date(111))
    })
    test('Date object creation with Utc time', () => {
        expect(dateHandler('Sun, 30 Mar 2025 18:02:50 GMT')).toEqual(new Date('Sun, 30 Mar 2025 18:02:50 GMT'))
    })

    test('Date object creation with timezone', () => {
        const date = new Date('Sun, 30 Mar 2025 15:02:50 GMT -3')
        date.setUTCHours(date.getUTCHours() + (-3))
        expect(dateHandler('Sun, 30 Mar 2025 18:02:50 GMT', '-03:00')).toEqual(date)
    })
})

describe('Test routes', () => {
    const app = new App(true).app

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
            // Ignora o último segundo do tempo
            function bypassSecond(obj) {
                const unix = Math.floor(obj.unix / 10000) * 10000
                const utc = obj.utc.replace(/\d{1}\sGMT/, '0 GMT');
                return { unix, utc };
            }

            const date = new Date()
            const expectedResponse = {
                unix: date.getTime(),
                utc: date.toUTCString()
            }
            response = await request(app).get('/api/')
            expect(bypassSecond(response.body)).toEqual(bypassSecond(expectedResponse))

        })

        it('Should save date in database without timezone', async () => {
            await request(app).get('/api/Sun,%2030%20Mar%202025%2020:30:27%20GMT')
            const data = await prisma.timestamp.findMany({
                where: {
                    searched_at : {
                        gte: new Date(Date.now() - 1000), // se o tempo de resposta do endpoint for maior que 1 segundo, o teste falha.
                    },
                    date: {
                        date: new Date('Sun, 30 Mar 2025 20:30:27 GMT'),
                        used_timezone: {
                            name: 'etc/gmt+00:00',
                            utc_offset: "+00:00",
                        },
                        aplicated_timezone: {
                            name: 'etc/gmt+00:00',
                            utc_offset: "+00:00",
                        }
                    },
                },
            })
            expect(data).toHaveLength(1)
        })

        it('Should save date and used timezone in the database', async () => {
            await request(app).get('/api/Sun,%2030%20Mar%202025%2019:20:57%20GMT+3')
            const data = await prisma.timestamp.findMany({
                where: {
                    searched_at : {
                        gte: new Date(Date.now() - 1000), // se o tempo de resposta do endpoint for maior que 1 segundo, o teste falha.
                    },
                    date: {
                        date: new Date('Sun, 30 Mar 2025 19:20:57 GMT+3'),
                        used_timezone: {
                            name: 'etc/gmt+03:00',
                            utc_offset: '+03:00'
                        },
                        aplicated_timezone: {
                            name: 'etc/gmt+00:00',
                            utc_offset: '+00:00'
                        }
                    }
                }
            })
            expect(data).toHaveLength(1)
        })

        it('Should save date and timezone in the database, by sending timezone name', async () => {
            const response = await request(app).get('/api/Sun,%2030%20Mar%202025%2012:13:57%20GMT+3?timezone=America/Belem')
            expect(response.body).not.toEqual({ error: "Invalid timezone_name" })
            const data = await prisma.timestamp.findMany({
                where: {
                    searched_at : {
                        gte: new Date(Date.now() - 1000), // se o tempo de resposta do endpoint for maior que 1 segundo, o teste falha.
                    },
                    date: {
                        date: new Date('Sun, 30 Mar 2025 12:13:57 GMT+3'),
                        used_timezone: {
                            name: 'etc/gmt+03:00',
                            utc_offset: '+03:00'
                        },
                        aplicated_timezone: {
                            name: 'America/Belem',
                            utc_offset: '-03:00'
                        }
                    }
                }
            })
            expect(data).toHaveLength(1)
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