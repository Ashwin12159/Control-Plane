import bcrypt from "bcryptjs";

async function main() {
  const userPassword = process.argv[2];

  if (!userPassword) {
    console.error("Please provide a password as an argument");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(userPassword, 10);
  console.log(hashedPassword);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});