import nerdamer from "nerdamer";
import { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { IconArrowsShuffle2 } from "@tabler/icons-react";
import { Differentiation } from "classes/Differentiation";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Flex,
  Group,
  LoadingOverlay,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";

require("nerdamer/Calculus");

type Params = {
  Solver: new () => Differentiation;
  isCentral?: boolean;
};

export function withDifferentiation({ Solver, isCentral }: Params) {
  return function Differentiat() {
    const solver = new Solver();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ value: number; error: number }>({
      value: NaN,
      error: NaN,
    });
    const [inputs, setInputs] = useState({
      x: { value: "", error: "" },
      equation: { value: "", error: "" },
    });

    const [h, setH] = useState(1);
    const [nth, setNth] = useState(1);
    const [order, setOrder] = useState(isCentral ? 2 : 1);

    const onFocus = (e: ChangeEvent<HTMLInputElement>) => {
      e.target.select();
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const key = name as keyof typeof inputs;

      setInputs((prev) => ({
        ...prev,
        [key]: { ...prev[key], value },
      }));
    };

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const key = name as keyof typeof inputs;

      if (value === "") {
        setInputs((prev) => ({
          ...prev,
          [key]: { ...prev[key], error: "This field is required" },
        }));
      } else {
        setInputs((prev) => ({
          ...prev,
          [key]: { ...prev[key], error: "" },
        }));
      }
    };

    const onError = (e: unknown) => {
      if (e instanceof AxiosError) {
        switch (e.response?.status) {
          case 400:
            notifications.show({
              color: "red",
              title: "Invalid data",
              message: "Please check your inputs",
            });

            break;

          case 409:
            break;

          case 404:
            notifications.show({
              color: "yellow",
              title: "No data",
              message: "Please try again later",
            });

            break;

          default:
            notifications.show({
              color: "red",
              title: "Something went wrong",
              message: "Please try again later",
            });

            break;
        }

        return;
      }

      if (e instanceof Error) {
        switch (e.message) {
          default:
            notifications.show({
              color: "red",
              title: "Something went wrong",
              message: "Please try again later",
            });

            break;
        }

        return;
      }
    };

    const onRandom = async () => {
      setLoading(true);

      try {
        const array: { [key: string]: any } = await solver.random();

        if (array.lenght === 0) {
          throw new Error("No data");
        }

        const output = array[0];

        setH(output.h);
        setInputs((prev) => ({
          ...prev,

          equation: { value: output.equation, error: "" },
          x: { value: output.x, error: "" },
        }));
      } catch (e) {
        onError(e);
      } finally {
        setLoading(false);
      }
    };

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();

      const { x, equation } = inputs;

      try {
        const res = solver.solve({
          x: parseFloat(x.value),
          h: h,
          nth: nth as 1 | 2 | 3 | 4,
          order: order as 1 | 2,
          equation: equation.value,
        });

        const trueValue = Number(
          nerdamer(nerdamer(`diff(${equation.value}, x, ${nth})`), {
            x: x.value,
          })
            .evaluate()
            .text(),
        );

        setResult({
          value: res,
          error: Differentiation.error(trueValue, res),
        });

        if (!Number.isNaN(result)) {
          await solver.save();
        }
      } catch (e) {
        onError(e);
      }
    };

    return (
      <>
        <Controller onSubmit={onSubmit}>
          <LoadingOverlay visible={loading} />
          <Flex justify="center" align="center">
            <Tooltip label="Random">
              <ActionIcon
                variant="filled"
                size="lg"
                radius="xl"
                onClick={onRandom}
              >
                <IconArrowsShuffle2 />
              </ActionIcon>
            </Tooltip>
          </Flex>
          <Group grow>
            <TextInput
              required
              label="Target"
              name="x"
              size="md"
              value={inputs.x.value}
              onBlur={onBlur}
              onFocus={onFocus}
              error={inputs.x.error}
              placeholder="0"
              onChange={onChange}
            />
            <NumberInput
              required
              size="md"
              label="Height"
              name="h"
              value={h}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder="0"
              onChange={(v) => setH(Number(v))}
            />
            <NumberInput
              required
              size="md"
              label="Order"
              name="nth"
              value={nth}
              onBlur={onBlur}
              onFocus={onFocus}
              min={1}
              max={4}
              step={1}
              placeholder="0"
              onChange={(v) => setNth(Number(v))}
            />
            <NumberInput
              required
              size="md"
              label="Power"
              name="order"
              value={order}
              onBlur={onBlur}
              onFocus={onFocus}
              min={isCentral ? 2 : 1}
              max={isCentral ? 4 : 2}
              step={isCentral ? 2 : 1}
              placeholder="0"
              onChange={(v) => setOrder(Number(v))}
            />
          </Group>
          <TextInput
            required
            size="md"
            label="Equation"
            name="equation"
            value={inputs.equation.value}
            onBlur={onBlur}
            onFocus={onFocus}
            onChange={onChange}
            error={inputs.equation.error}
            placeholder="x^2 + 2x + 1"
          />
          <Button mt={16} size="md" type="submit" onSubmit={onSubmit}>
            Calculate
          </Button>
        </Controller>
        {!Number.isNaN(result.value) ? (
          <>
            <Solution error={result.error} result={result.value} />
          </>
        ) : null}
      </>
    );
  };
}

const Controller = ({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
}) => (
  <Card
    withBorder
    shadow="sm"
    padding="xl"
    component="form"
    onSubmit={onSubmit}
  >
    <Stack gap={24}>{children}</Stack>
  </Card>
);

const Solution = ({ result, error }: { result: number; error: number }) => (
  <Card withBorder shadow="sm" padding="xl">
    <Stack align="center" gap={16}>
      <Text fz={20} fw={500}>
        Solution
      </Text>
      <Title my={16} mb={32} fw={600} fz={30} order={1}>
        {result.toString()}
      </Title>
      <Text fz={16} fw={400}>
        Error: {(Math.abs(error) * 100).toFixed(6)}%
      </Text>
    </Stack>
  </Card>
);
