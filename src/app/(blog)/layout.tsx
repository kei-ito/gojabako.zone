import type { PropsWithChildren } from "react";
import { Article } from "../../components/Article";
import { SiteLayout } from "../../components/SiteLayout";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <SiteLayout>
      <Article>{children}</Article>
    </SiteLayout>
  );
}
