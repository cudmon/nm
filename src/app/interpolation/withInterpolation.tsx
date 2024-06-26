"use client";

import { Graph } from "components/Graph";
import { dot, line, ruleY } from "@observablehq/plot";
import { Interpolation } from "classes/Interpolation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Fieldset,
  Flex,
  LoadingOverlay,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowsShuffle2 } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

type Input = {
  x: string;
  y: string;
}[];

type Params = {
  Solver: new () => Interpolation;
};

type Result = {
  x: number;
  y: number;
};

export function withInterpolation({ Solver }: Params) {
  return function Base() {
    const solver = new Solver();

    const [size, setSize] = useState<number>(2);
    const [target, setTarget] = useState<string>("");
    const [spots, setSpots] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<Result>({ x: NaN, y: NaN });
    const [data, setData] = useState<Input>([
      { x: "", y: "" },
      { x: "", y: "" },
    ]);

    function onChange(event: ChangeEvent<HTMLInputElement>) {
      const { name, value } = event.currentTarget;

      if (name.includes("x") || name.includes("y")) {
        const array = [...data];
        const index = Number(name.split("-")[1]);

        if (name.includes("x")) {
          array[index].x = value;
        } else {
          array[index].y = value;
        }

        return setData(array);
      }

      setTarget(value);
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

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();

      try {
        const input = data.map((d) => ({ x: Number(d.x), y: Number(d.y) }));

        solver.setData(input);

        const lagrange = solver.interpolate(Number(target), spots);

        setResult({ x: Number(target), y: lagrange });

        if (!Number.isNaN(lagrange)) {
          await solver.save();
        }
      } catch (e) {
        onError(e);
      }
    };

    function onCheck(index: number) {
      const array = [...spots];

      if (array.includes(index)) {
        array.splice(array.indexOf(index), 1);
      } else {
        array.push(index);
      }

      setSpots(array);
    }

    useEffect(() => {
      if (size >= 2) {
        setData((prev) => {
          const obj = [...prev];

          if (size > prev.length) {
            for (let i = prev.length; i < size; i++) {
              obj.push({ x: "", y: "" });
            }
          } else {
            obj.splice(size, prev.length - size);
          }

          return obj;
        });
      }
    }, [size]);

    return (
      <Stack gap={16}>
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
            <Flex align="center" gap={8}>
              <TextInput
                size="md"
                w="100%"
                mr="auto"
                type="number"
                label="Target"
                name="target"
                placeholder="x"
                onFocus={(e) => e.target.select()}
                value={target}
                onChange={onChange}
              />
              <NumberInput
                value={size}
                allowNegative={false}
                size="md"
                name="size"
                min={2}
                onFocus={(e) => e.target.select()}
                max={10}
                label="Size"
                placeholder="3"
                onChange={(value) => setSize(Number(value))}
              />
            </Flex>
            <Fieldset legend="Data">
              <Stack>
                {data.map((d, i) => (
                  <Flex key={i} gap={16} align="center">
                    <Checkbox
                      value={spots[i]}
                      onChange={() => onCheck(i)}
                      label={`${i}`}
                      name={`point-${i}`}
                    />
                    <TextInput
                      value={d.x}
                      w="100%"
                      onFocus={(e) => e.target.select()}
                      type="number"
                      placeholder="x0"
                      name={`x-${i}`}
                      onChange={onChange}
                    />
                    <TextInput
                      value={d.y}
                      w="100%"
                      type="number"
                      placeholder="y0"
                      name={`y-${i}`}
                      onFocus={(e) => e.target.select()}
                      onChange={onChange}
                    />
                  </Flex>
                ))}
              </Stack>
            </Fieldset>
            <Button onClick={onSubmit} size="md">
              Interpolate
            </Button>
          </Stack>
        </Card>
        {!Number.isNaN(result.y) ? (
          <>
            <Card withBorder shadow="sm" padding="xl">
              <Stack align="center" gap={16}>
                <Text fz={22} fw={500}>
                  Solution
                </Text>
                <Title my={16} mb={32} order={1}>
                  {Number.isNaN(result.y) ? "NaN" : result.y}
                </Title>
              </Stack>
            </Card>
            <Graph
              options={{
                marks: [
                  dot([result], {
                    x: "x",
                    y: "y",
                    fill: "green",
                    tip: true,
                  }),
                  dot(data, {
                    x: "x",
                    y: "y",
                    fill: "red",
                    tip: true,
                  }),
                  line(data, {
                    x: "x",
                    y: "y",
                    stroke: "red",
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
