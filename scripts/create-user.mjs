import dotenv from "dotenv";
import readline from "node:readline";

dotenv.config({ path: ".env.local" });

const baseUrl = process.env.NEON_AUTH_BASE_URL;

if (!baseUrl) {
  console.error("NEON_AUTH_BASE_URL is not configured.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function passwordQuestion(prompt) {
  return new Promise((resolve) => {
    const onKeypress = () => {
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
      process.stdout.write(prompt + "*".repeat(rl.line.length));
    };

    process.stdin.on("keypress", onKeypress);

    rl.question(prompt, (value) => {
      process.stdin.removeListener("keypress", onKeypress);
      resolve(value);
    });
  });
}

async function main() {
  console.log("\nGraffSnap user creation\n");

  const name = await question("Name: ");
  const email = await question("Email: ");
  const password = await passwordQuestion("Password: ");

  console.log("\nCreating user...");

  try {
    const response = await fetch(`${baseUrl}/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(
        `✗ User creation failed: ${result.message ?? "Unknown error"}`,
      );
      process.exit(1);
    }

    console.log("✓ User created successfully");
    console.log(`User ID: ${result.user.id}`);
  } catch (error) {
    console.error("✗ User creation failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
