import { Graph } from "components/Graph";
import { Regression } from "classes/Regression";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { dot, linearRegressionY } from "@observablehq/plot";
import {
  ActionIcon,
  Button,
  Card,
  Fieldset,
  Flex,
  Group,
  Input,
  LoadingOverlay,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { IconArrowsShuffle2 } from "@tabler/icons-react";

type Input = {
  x: string[];
  y: string;
}[];

type Params = {
  Solver: new () => Regression;
};

export function withRegression({ Solver }: Params) {
  return function App() {
    const solver = new Solver();

    const [m, setM] = useState<number>(1);
    const [size, setSize] = useState<number>(2);
    const [loading, setLoading] = useState<boolean>(false);
    const [variableSize, setVariableSize] = useState<number>(1);
    const [target, setTarget] = useState<string[]>([""]);
    const [multiple, setMultiple] = useState<string>("single");
    const [displayableData, setDisplayableData] = useState<
      { x: number; y: number }[]
    >([]);

    const [result, setResult] = useState({
      value: 0,
      equation: "",
    });

    const [data, setData] = useState<Input>([
      { x: [""], y: "" },
      { x: [""], y: "" },
    ]);

    function onFocus(event: ChangeEvent<HTMLInputElement>) {
      event.target.select();
    }

    function onChange(event: ChangeEvent<HTMLInputElement>) {
      const { name, value } = event.currentTarget;

      if (name.includes("x") || name.includes("y")) {
        const array = [...data];
        const index = Number(name.split("-")[1]);

        if (name.includes("x")) {
          const i = Number(name.split("-")[2]);

          array[index].x[i] = value;
        }

        if (name.includes("y")) {
          array[index].y = value;
        }

        return setData(array);
      }

      if (name.includes("target")) {
        const array = [...target];
        const index = Number(name.split("-")[1]);

        array[index] = value;

        return setTarget(array);
      }
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
        const array: { [key: string]: any } = await solver.random(
          multiple === "multiple",
        );

        if (array.lenght === 0) {
          throw new Error("No data");
        }

        const output = array[0];

        setSize(output.x.length);
        setVariableSize(output.target.length);
        setTarget(output.target);
        setData(() => {
          const obj = [];

          for (let i = 0; i < output.x.length; i++) {
            obj.push({ x: output.x[i], y: output.y[i] });
          }

          return obj;
        });
      } catch (e) {
        onError(e);
      } finally {
        setLoading(false);
      }
    };

    async function onSubmit(e: FormEvent) {
      e.preventDefault();

      const input = data.map((d) => ({
        x: d.x.map(Number),
        y: Number(d.y),
      }));

      try {
        let value = 0;
        let a: number[] = [];
        let equation = "";

        solver.setData(input);

        if (variableSize === 1) {
          const obj = solver.polynomial(m, Number(target[0]));

          a = obj.a;
          value = obj.value;
          equation = a.map((a, i) => `${a.toFixed(2)}x^${i}`).join(" + ");
        }

        if (variableSize > 1) {
          const obj = solver.multipleLinear(target.map(Number));

          a = obj.a;
          value = obj.value;
          equation = a.map((a, i) => `${a.toFixed(2)}x${i}`).join(" + ");
        }

        setResult({
          value,
          equation,
        });

        const array: { x: number; y: number }[] = [];

        for (const obj of data) {
          obj.x.map(Number).forEach((x) => {
            array.push({ x, y: Number(obj.y) });
          });
        }

        setDisplayableData(array);

        if (!a.includes(NaN)) {
          await solver.save();
        }
      } catch (e) {
        onError(e);
      }
    }

    useEffect(() => {
      setData((prev) => {
        const obj = [...prev];

        if (size > prev.length) {
          for (let i = prev.length; i < size; i++) {
            obj.push({ x: Array(variableSize).fill(""), y: "" });
          }
        } else {
          obj.splice(size, prev.length - size);
        }

        return obj;
      });
    }, [size, variableSize]);

    useEffect(() => {
      if (multiple === "single") {
        setM(1);
        setVariableSize(1);
      }
    }, [multiple]);

    const handleVariableChange = (value: string) => {
      setVariableSize(() => {
        const s = Number(value);

        setTarget((prev) => {
          const obj = [...prev];

          if (s > prev.length) {
            for (let i = prev.length; i < s; i++) {
              obj.push("");
            }
          } else {
            obj.splice(s, prev.length - s);
          }

          return obj;
        });

        setData((prev) => {
          const obj = [...prev];

          for (let i = 0; i < prev.length; i++) {
            if (s > prev[i].x.length) {
              for (let j = prev[i].x.length; j < s; j++) {
                obj[i].x.push("");
              }
            } else {
              obj[i].x.splice(s, prev[i].x.length - s);
            }
          }

          return obj;
        });

        return s;
      });
    };

    return (
      <Stack gap={16}>
        <SegmentedControl
          fullWidth
          size="md"
          value={multiple === "multiple" ? "multiple" : "single"}
          onChange={(value) => setMultiple(value)}
          data={[
            { label: "Single", value: "single" },
            { label: "Multiple", value: "multiple" },
          ]}
        />
        <Card shadow="sm" padding="xl" withBorder>
          <Stack>
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
              {multiple === "single" ? (
                <>
                  <NumberInput
                    value={m}
                    allowNegative={false}
                    size="md"
                    name="m"
                    min={1}
                    onFocus={onFocus}
                    max={5}
                    label="M"
                    onChange={(value) => setM(Number(value))}
                  />
                </>
              ) : (
                <NumberInput
                  value={variableSize}
                  allowNegative={false}
                  size="md"
                  name="x"
                  min={1}
                  onFocus={onFocus}
                  max={3}
                  label="X"
                  onChange={(value) => handleVariableChange(String(value))}
                />
              )}
              <NumberInput
                value={size}
                allowNegative={false}
                size="md"
                name="size"
                min={2}
                onFocus={onFocus}
                max={10}
                label="Size"
                onChange={(value) => setSize(Number(value))}
              />
            </Group>
            <Flex align="center" gap={8}>
              {Array(variableSize)
                .fill(null)
                .map((_, i) => (
                  <TextInput
                    key={i}
                    w="100%"
                    value={target[i]}
                    size="md"
                    name={`target-${i}`}
                    onFocus={onFocus}
                    label={`Target ${i}`}
                    onChange={onChange}
                  />
                ))}
            </Flex>
            <Fieldset legend="Data">
              <Stack>
                {data.map((d, i) => (
                  <Flex key={i} gap={16} align="center">
                    {Array(variableSize)
                      .fill(null)
                      .map((_, j) => (
                        <TextInput
                          key={j}
                          w="100%"
                          value={d.x[j]}
                          name={`x-${i}-${j}`}
                          onFocus={onFocus}
                          placeholder={`x${i}${j}`}
                          onChange={onChange}
                        />
                      ))}
                    <TextInput
                      value={d.y}
                      w="100%"
                      type="number"
                      placeholder={`y${i}`}
                      name={`y-${i}`}
                      onFocus={onFocus}
                      onChange={onChange}
                    />
                  </Flex>
                ))}
              </Stack>
            </Fieldset>
            <Button onClick={onSubmit} size="md">
              Calculate
            </Button>
          </Stack>
        </Card>
        {result.equation !== "" ? (
          <>
            <Card withBorder shadow="sm" padding="xl">
              <Stack align="center" gap={16}>
                <Text fz={22} fw={500}>
                  Result
                </Text>
                <Title my={16} mb={32} order={1}>
                  {Number.isNaN(result.value) ? "NaN" : result.value}
                </Title>
                <Text fz={14} fw={500}>
                  {result.equation}
                </Text>
              </Stack>
            </Card>
            <Graph
              options={{
                marks: [
                  dot(displayableData, {
                    x: "x",
                    y: "y",
                    tip: { fill: "black" },
                    fill: "#dc2626",
                  }),
                  linearRegressionY(displayableData, {
                    x: "x",
                    y: "y",
                    stroke: "#2563eb",
                  }),
                ],
              }}
            />
          </>
        ) : null}
      </Stack>
    );
  };
}
