"use client";

import { useAppSelector } from "@/store";
import { useSelectToken } from "@/store/features/auth";
import { ReactNode, useEffect } from "react";

const WorkerWrapper = ({ children }: { children: ReactNode }) => {
  const accessToken = useAppSelector(useSelectToken);

  useEffect(() => {
    if (typeof SharedWorker !== "undefined") {
      // Initialize the Shared Worker
      const worker = new SharedWorker("/sharedWorker.js");

      worker.port.start(); // Start the port

      // Listen for messages from the Shared Worker
      worker.port.onmessage = (event) => {
        if (event?.data?.type === "connected") {
          worker.port.postMessage({ type: "token", data: accessToken });
          console.info(event?.data?.data);
        }
      };

      worker.port.postMessage({
        type: "connect",
        data: process.env.NEXT_PUBLIC_SOCKET,
      });

      // Send a message to the Shared Worker

      return () => {
        worker.port.close(); // Close the port when the component is unmounted
      };
    }
  }, [accessToken]);

  return <>{children}</>;
};

export default WorkerWrapper;
