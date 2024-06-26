import { Skeleton, Stack } from "@mantine/core";

export default function Loading() {
  return (
    <Stack gap={32}>
      <Skeleton radius="md" mt={24} height={50} />
      <Skeleton radius="md" height={300} />
    </Stack>
  );
}
