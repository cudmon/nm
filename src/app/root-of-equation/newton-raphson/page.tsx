import App from "./App";
import { Title } from "@mantine/core";

export const metadata = {
  title: "Newton-Raphson",
};

export default function Page() {
  return (
    <>
      <Title ta="center" my={16}>
        {metadata.title}
      </Title>
      <App />
    </>
  );
}
