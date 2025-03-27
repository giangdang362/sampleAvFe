import { passwordSchema } from "@/constants/zod";
import { Resolver, zodResolver } from "@hookform/resolvers/zod";
import { DeepPartial } from "react-hook-form";
import { z as zod } from "zod";

const refineListOther = [
  (data: { list: string[]; other?: string | null }) =>
    (typeof data.other === "string" ? data.other !== "" : true) &&
    (data.list?.length || data.other),
  (data: { list: string[]; other?: string | null }) => {
    if (data.other === "") {
      return {
        message: "This field is required",
        path: ["other"],
      };
    }

    return {
      message: "This is required",
      path: ["list"],
    };
  },
] as const;

export const schemaAccount = zod
  .object({
    email: zod.string().min(1, { message: "Email is required" }).email(),
    password: passwordSchema,
    rePassword: zod
      .string()
      .min(1, { message: "Confirm Password is required" }),
    firstName: zod.string().trim().min(1, { message: "Name is required" }),
    social: zod.object({
      linkedin: zod
        .string()
        .nonempty({ message: "This field is required" })
        .regex(
          /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
          "Not a Link",
        ),
    }),
    data: zod.object({
      primarilyWork: zod
        .object({
          list: zod.array(zod.string().trim()),
          other: zod.string().trim().nullable(),
        })
        .refine(...refineListOther),
    }),
    organization: zod.object({
      name: zod.string().trim().nonempty({ message: "This field is required" }),
      website: zod
        .string()
        .nonempty({ message: "This field is required" })
        .regex(
          /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
          "Not a Link",
        ),
      phone: zod
        .string()
        .nonempty({ message: "This field is required" })
        .regex(/^\+[0-9 ()-]+$/g, "Invalid phone number"),
      address: zod.object({
        addressLine1: zod
          .string()
          .trim()
          .nonempty({ message: "This field is required" }),
        countryId: zod.number().min(1, { message: "This field is required" }),
      }),
      data: zod.object({
        expertise: zod
          .object({
            list: zod.array(zod.string().trim()),
            other: zod.string().trim().nullable(),
          })
          .refine(...refineListOther),
        clientTypes: zod
          .object({
            list: zod.array(zod.string().trim()),
            other: zod.string().trim().nullable(),
          })
          .refine(...refineListOther),
      }),
    }),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Confirm Password doesn't match",
    path: ["rePassword"],
  });
export type Account = zod.infer<typeof schemaAccount>;

export const signUpZodResolver: ReturnType<Resolver> = (async (
  fields,
  context,
  options,
) => {
  const result = await zodResolver(schemaAccount)(fields, context, options);

  if (
    !("rePassword" in result.errors) &&
    fields.password !== fields.rePassword
  ) {
    return {
      ...result,
      errors: {
        ...result.errors,
        rePassword: {
          message: "Confirm Password doesn't match",
          ref: options.fields.rePassword?.ref,
          type: "custom",
        },
      },
    };
  }

  return result;
}) as ReturnType<Resolver>;

export const defaultAccount = {
  email: "",
  password: "",
  rePassword: "",
  firstName: "",
  social: {
    linkedin: "",
  },
  data: {
    primarilyWork: {
      list: [],
      other: null,
    },
  },
  organization: {
    name: "",
    website: "",
    phone: "",
    address: {
      addressLine1: "",
    },
    data: {
      expertise: {
        list: [],
        other: null,
      },
      clientTypes: {
        list: [],
        other: null,
      },
    },
  },
} satisfies DeepPartial<Account>;
