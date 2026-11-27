const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword = await bcrypt.hash("123456", 10);

        await mongoose.connection.collection("users").updateOne(
            { email: "admin@hiresphere.com" },
            {
                $set: {
                    name: "HireSphere Admin",
                    email: "admin@hiresphere.com",
                    password: hashedPassword,
                    role: "admin",
                    isActive: true
                }
            },
            { upsert: true }
        );

        console.log("Admin created successfully!");

        await mongoose.disconnect();

    } catch (error) {
        console.log(error.message);
        process.exitCode = 1;
        await mongoose.disconnect();
    }
};

createAdmin();