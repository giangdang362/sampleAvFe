import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be more than 8 characters" })
  .max(32, { message: "Password must be less than 32 characters" })
  .regex(
    RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]*$",
    ),
    {
      message:
        "Password must include at least 8 characters, uppercase, lowercase, number, special character, and no spaces",
    },
  );
