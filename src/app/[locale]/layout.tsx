import { type ReactNode } from "react";
import { useLocale, useMessages, useTimeZone } from "next-intl";
import ClientProviders from "./ClientProviders";
import { UserDialogProvider } from "@/components/common/UserDialog";
import { AuthGuard } from "@/components/auth/AuthGuard";
import WorkerWrapper from "@/components/scoket/WorkerWrapper";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  const messages = useMessages();
  const locale = useLocale();
  const timeZone = useTimeZone();

  return (
    <ClientProviders locale={locale} timeZone={timeZone} messages={messages}>
      <UserDialogProvider>
        <WorkerWrapper>
          <AuthGuard permissions={[]}>{children}</AuthGuard>
        </WorkerWrapper>
      </UserDialogProvider>
    </ClientProviders>
  );
}
