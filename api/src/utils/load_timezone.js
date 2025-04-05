import { PrismaClient } from "@prisma/client";
import axios from "axios";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

async function getWikiTimezones(url) {
	try {
		const { data } = await axios.get(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
			}
		});

		const $ = cheerio.load(data);
		const table = $("table.wikitable").first();

		const timezonePromises = table.find("tr").map((index, row) => {
			let rowData = [];

			$(row).find("th, td").each((_, cell) => {
				rowData.push($(cell).text().trim().replace(/\s+/g, " "));
			});

			if (rowData.length >= 6 && rowData[4].lenght <= 6 && rowData[5].length <= 6) {
				return prisma.timezone.create({
					data: {
						country_code: rowData[0].slice(0, 2),
						utc_offset: rowData[4],
						name: rowData[1],
						daylight_saving_offset: rowData[5]
					},
				});
			}
		}).get();

		await Promise.all(timezonePromises);
		console.log("Dados inseridos com sucesso!");

	} catch (error) {
		console.error("Erro ao buscar dados:", error);
	}
}


getWikiTimezones("https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List")
.catch((e) => {
	console.error(e);
})
.finally(async () => {
	await prisma.$disconnect();
});
