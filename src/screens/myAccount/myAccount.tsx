"use client";

import { Button, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import FormUpdateUser from "./components/formUpdateUser";
import { useState } from "react";
import FormUpdatePass from "./components/formUpdatePass";
import { useHashState } from "@/hooks/useHashState";

interface TabType {
  id: number;
  name: string;
  hash: string;
}

const MyAccount = () => {
  const tab = useHashState(["my-account", "password"], "my-account");
  const [tabs] = useState<TabType[]>(() => [
    { id: 1, name: "My Account", hash: "my-account" },
    { id: 2, name: "Password", hash: "password" },
  ]);

  return (
    <Stack gap="24px" sx={{ marginTop: "100px" }}>
      <Grid2
        container
        columns={16}
        columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
      >
        <Grid2 xs={2}>
          {tabs?.map((item, index) => (
            <Button
              key={index}
              sx={{ marginBottom: "8px" }}
              href={"#" + item.hash}
            >
              <Typography
                sx={
                  item.hash === tab
                    ? {
                        textDecoration: "underline",
                        fontWeight: 700,
                      }
                    : undefined
                }
                display="inline"
                variant="body1"
              >
                {item.name}
              </Typography>
            </Button>
          ))}
        </Grid2>
        <Grid2 xs={14}>
          {tab === "password" ? <FormUpdatePass /> : <FormUpdateUser />}
        </Grid2>
      </Grid2>
    </Stack>
  );
};

export default MyAccount;
