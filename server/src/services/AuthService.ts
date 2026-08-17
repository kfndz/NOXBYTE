import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const AuthService = {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error("Credenciais inválidas.");
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      throw new Error("Credenciais inválidas.");
    }

    const secret =
      process.env.JWT_SECRET ?? "dev-secret-key-change-in-production";

    if (!process.env.JWT_SECRET) {
      console.warn(
        "JWT_SECRET não definido; usando fallback de desenvolvimento.",
      );
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: "admin",
      },
      secret,
      {
        expiresIn: "7d",
      },
    );

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  },
};
