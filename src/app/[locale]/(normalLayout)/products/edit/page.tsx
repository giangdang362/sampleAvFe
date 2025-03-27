"use client";

import * as React from "react";

import EditProduct from "@/screens/products/EditProduct";

export default function Page({}: {
  params?: { id: string };
}): React.JSX.Element {
  return <EditProduct />;
}
