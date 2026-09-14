"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { prefetchMyPageStamps } from "@/features/visit-records/stamp-prefetch";

type MyPageLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export function MyPageLink(props: MyPageLinkProps) {
  return (
    <Link
      {...props}
      href="/my"
      onFocus={(event) => {
        prefetchMyPageStamps();
        props.onFocus?.(event);
      }}
      onPointerDown={(event) => {
        prefetchMyPageStamps();
        props.onPointerDown?.(event);
      }}
      onPointerEnter={(event) => {
        prefetchMyPageStamps();
        props.onPointerEnter?.(event);
      }}
      onTouchStart={(event) => {
        prefetchMyPageStamps();
        props.onTouchStart?.(event);
      }}
    />
  );
}
