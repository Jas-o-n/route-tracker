import { db } from "./index";
import { migrate } from "drizzle-orm/neon-http/migrator";

const main = async () => {
    try {
        await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
        console.log("Database migration completed successfully.");
    } catch (error) {
        console.error("Database migration failed:", error);
        process.exit(1);
    }
}

main()