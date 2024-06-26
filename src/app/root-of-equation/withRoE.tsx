import { RoE } from "classes/RoE";
import { Graph } from "components/Graph";
import { notifications } from "@mantine/notifications";
import { dot, lineY, ruleY } from "@observablehq/plot";
import { IconArrowsShuffle2 } from "@tabler/icons-react";
import { ChangeEvent, FC, FormEvent, ReactNode, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { AxiosError } from "axios";

type Params = {
  Component: FC<Props>;
  Solver: new () => RoE;
};

type Props = {
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus: (e: ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;

  inputs: {
    x: { value: string; error: string }[];
    equation: { value: string; error: string };
  };
};

export function withRoE({ Component, Solver }: Params) {
  return function RoE() {
    const solver = new Solver();

    const [loading, setLoading] = useState(false);

    const [results, setResults] = useState({
      top: 0,
      bottom: 0,
      x: [0],
    });

    const [inputs, setInputs] = useState({
      x: [
        { value: "", error: "" },
        { value: "", error: "" },
      ],
      equation: { value: "", error: "" },
    });

    const onFocus = (e: ChangeEvent<HTMLInputElement>) => {
      e.target.select();
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const key = name as keyof typeof inputs;

      if (key.includes("x")) {
        const index = key.split("x")[1];

        setInputs((prev) => ({
          ...prev,
          x: prev.x.map((x, i) => {
            if (i === parseInt(index)) {
              return { ...x, value };
            }
            return x;
          }),
        }));
      }

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

        setInputs((prev) => ({
          ...prev,

          equation: { value: output.equation, error: "" },
          x: prev.x.map((x, i) => ({ value: output.x[i], error: "" })),
        }));
      } catch (e) {
        onError(e);
      } finally {
        setLoading(false);
      }
    };

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();

      const equation = inputs.equation.value;
      const x0 = parseFloat(inputs.x[0].value);
      const x1 = parseFloat(inputs.x[1].value);

      try {
        const result = solver.solve(equation, [x0, x1]);

        setResults({
          top: x0,
          bottom: result.at(0)!,
          x: result,
        });

        if (!result.includes(NaN) && !result.includes(Infinity)) {
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
          <TextInput
            required
            size="md"
            name="equation"
            label="Equation"
            onBlur={onBlur}
            onFocus={onFocus}
            onChange={onChange}
            placeholder="f(x) = 0"
            value={inputs.equation.value}
            error={inputs.equation.error}
          />
          <Group grow>
            <Component
              inputs={inputs}
              onBlur={onBlur}
              onFocus={onFocus}
              onChange={onChange}
            />
          </Group>
          <Button mt={16} size="md" type="submit" onSubmit={onSubmit}>
            Calculate
          </Button>
        </Controller>
        {results.x.length > 1 ? (
          <>
            <Solution result={results.x.at(-1)!} />
            <Visualize
              data={results.x}
              top={results.top}
              bottom={results.bottom}
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

const Solution = ({ result }: { result: number }) => (
  <Card withBorder shadow="sm" padding="xl">
    <Stack align="center" gap={16}>
      <Text fz={20} fw={500}>
        Solution
      </Text>
      <Title my={16} mb={32} fw={600} fz={30} order={1}>
        {result}
      </Title>
    </Stack>
  </Card>
);

const Visualize = ({
  data,
  top,
  bottom,
}: {
  data: number[];
  top: number;
  bottom: number;
}) => (
  <Graph
    options={{
      marks: [
        ruleY([bottom, top]),
        lineY(
          data.map((value, index) => ({
            i: index + 1,
            y: value,
          })),
          { x: "i", y: "y", stroke: "#2563eb" },
        ),
        dot(
          data.map((value, index) => ({
            i: index + 1,
            y: value,
          })),
          { x: "i", y: "y", fill: "#dc2626", tip: true },
        ),
      ],
    }}
  />
);
