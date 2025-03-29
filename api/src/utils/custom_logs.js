import chalk from "chalk"

// Exibe uma mensagem de aviso no console
export const warn = (...content) => {
    const formattedContent = content.map(i =>
        typeof i === "string" ? i.replaceAll("\n", `\n${chalk.yellow.bold('Warning')} `) : i
    );
    console.warn("---\n" + chalk.yellow.bold('Warning'), ...formattedContent, "\n---");
};


// Exibe uma mensagem de erro no console
export const error = (...content) => {
    const formattedContent = content.map(i =>
        typeof i === "string" ? i.replaceAll("\n", `\n${chalk.red.bold('Error')} `) : i
    );
    console.error("---\n" + chalk.red.bold('Error'), ...formattedContent, "\n---");
}