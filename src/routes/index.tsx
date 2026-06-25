import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/shark-aspirador-de-maos", replace: true });
  },
  component: () => null,
});
