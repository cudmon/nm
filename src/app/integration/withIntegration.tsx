"use client";

require("nerdamer/Calculus");

import nerdamer from "nerdamer";
import { Graph } from "../../components/Graph";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { areaY, lineY } from "@observablehq/plot";
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
import { Integration } from "classes/Integration";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { IconArrowsShuffle2 } from "@tabler/icons-react";

type Params = {
  Solver: new () => Integration;
};

export function withIntegration({ Solver }: Params) {
  return function Integrat() {
    const solver = new Solver();

    const [n, setN] = useState<number>(1);
    const [result, setResult] = useState<{ value: number; error: number }>({
      value: NaN,
      error: NaN,
    });
    const [data, setData] = useState<number[][]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [inputs, setInputs] = useState({
      equation: { value: "", error: "" },
      from: { value: "", error: "" },
      to: { value: "", error: "" },
    });

    function onChange(event: ChangeEvent<HTMLInputElement>) {
      const { name, value } = event.currentTarget;

      setInputs((prev) => ({
        ...prev,
        [name]: { value, error: "" },
      }));
    }

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

        setInputs({
          equation: { value: output.equation, error: "" },
          from: { value: output.from, error: "" },
          to: { value: output.to, error: "" },
        });
      } catch (e) {
        onError(e);
      } finally {
        setLoading(false);
      }
    };

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();

      const { equation, from, to } = inputs;

      try {
        const res = solver.solve(
          equation.value,
          Number(from.value),
          Number(to.value),
          n,
        );

        const trueValue = Number(
          nerdamer(
            `defint(${inputs.equation.value}, ${inputs.from.value}, ${inputs.to.value})`,
          ).text(),
        );

        setData([]);
        setResult({
          value: res,
          error: Integration.error(trueValue, res),
        });

        if (!Number.isNaN(res)) {
          for (let i = Number(from.value); i <= Number(to.value); i += 0.1) {
            setData((prev) => [
              ...prev,
              [
                i,
                Number(
                  nerdamer(equation.value, { x: i.toString() })
                    .evaluate()
                    .text(),
                ),
              ],
            ]);
          }

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
              size="md"
              name="equation"
              label="Equation"
              onChange={onChange}
              value={inputs.equation.value}
              placeholder="Enter an equation"
            />
            <NumberInput
              required
              size="md"
              name="n"
              label="N"
              value={n}
              placeholder="n"
              onChange={(value) => setN(Number(value))}
            />
          </Group>
          <Group grow>
            <TextInput
              required
              size="md"
              type="number"
              name="from"
              label="From"
              onChange={onChange}
              value={inputs.from.value}
              placeholder="From"
            />
            <TextInput
              required
              size="md"
              name="to"
              type="number"
              label="To"
              onChange={onChange}
              value={inputs.to.value}
              placeholder="To"
            />
          </Group>
          <Button mt={16} size="md" type="submit" onSubmit={onSubmit}>
            Calculate
          </Button>
        </Controller>
        {!Number.isNaN(result.value) ? (
          <>
            <Solution error={result.error} result={result.value} />
            <Graph
              options={{
                marks: [
                  areaY(data, { x: "0", y: "1", fill: "#2563eb" }),
                  lineY(data, {
                    x: "0",
                    y: "1",
                    stroke: "#dc2626",
                    strokeWidth: 3,
                  }),
                ],
              }}
            />
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
