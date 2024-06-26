import { AxiosError } from "axios";
import { Matrix } from "classes/Matrix";
import { notifications } from "@mantine/notifications";
import { IconArrowsShuffle2 } from "@tabler/icons-react";
import { ChangeEvent, FC, FormEvent, ReactNode, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Fieldset,
  Flex,
  LoadingOverlay,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";

type Params = {
  Component: FC<Props>;
  Solver: new () => Matrix;
};

type Props = {
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus: (e: ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;

  x0: { value: string; error: string }[];
  dimension: number;
  inputs: {
    vector: { value: string; error: string }[];
    matrix: { value: string; error: string }[][];
  };
};

export function withMatrix({ Component, Solver }: Params) {
  return function Matrix() {
    const solver = new Solver();

    const [loading, setLoading] = useState(false);
    const [dimension, setDimension] = useState(2);
    const [results, setResults] = useState<number[]>([]);
    const [inputs, setInputs] = useState({
      vector: [
        { value: "", error: "" },
        { value: "", error: "" },
      ],
      matrix: [
        [
          { value: "", error: "" },
          { value: "", error: "" },
        ],
        [
          { value: "", error: "" },
          { value: "", error: "" },
        ],
      ],
    });

    const [x0, setX0] = useState([
      { value: "", error: "" },
      { value: "", error: "" },
    ]);

    const onFocus = (e: ChangeEvent<HTMLInputElement>) => {
      e.target.select();
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name.startsWith("Ax")) {
        const next = [...inputs.matrix];
        const [row, col] = name.split("Ax")[1].split("");

        next[Number(row)][Number(col)] = { value, error: "" };

        setInputs({ ...inputs, matrix: next });
      }

      if (name.startsWith("B")) {
        const next = [...inputs.vector];
        const index = name.split("B")[1];

        next[Number(index)] = { value, error: "" };

        setInputs({ ...inputs, vector: next });
      }

      if (name.startsWith("x")) {
        const next = [...x0];
        const index = name.split("x")[1];

        next[Number(index)] = { value, error: "" };

        setX0(next);
      }
    };

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name.startsWith("Ax")) {
        const next = [...inputs.matrix];
        const [row, col] = name.split("Ax")[1].split("");

        if (value === "") {
          next[Number(row)][Number(col)] = { value, error: "Required" };

          return setInputs({ ...inputs, matrix: next });
        }
      }

      if (name.startsWith("B")) {
        const next = [...inputs.vector];
        const index = name.split("B")[1];

        if (value === "") {
          next[Number(index)] = { value, error: "Required" };

          return setInputs({ ...inputs, vector: next });
        }
      }

      if (name.startsWith("x")) {
        const next = [...x0];
        const index = name.split("x")[1];

        if (value === "") {
          next[Number(index)] = { value, error: "Required" };

          return setX0(next);
        }
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
        const array = await solver.random(dimension);

        const { vector, matrix, x } = array[0];

        setInputs({
          vector: vector.map((value: number) => ({
            value: String(value),
            error: "",
          })),
          matrix: matrix.map((row: number[]) =>
            row.map((value) => ({ value: String(value), error: "" })),
          ),
        });

        setX0(() =>
          Array.from({ length: dimension }, (_, i) => ({
            value: x[i],
            error: "",
          })),
        );
      } catch (e) {
        onError(e);
      } finally {
        setLoading(false);
      }
    };

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();

      try {
        const array = solver.solve(
          inputs.matrix.map((row) => row.map((input) => Number(input.value))),
          inputs.vector.map((input) => Number(input.value)),
          x0.map((input) => Number(input.value)),
        );

        setResults(array);

        if (!array.includes(NaN) && !array.includes(Infinity)) {
          await solver.save();
        }
      } catch (e) {
        onError(e);
      }
    };

    const resizer = (size: number) => {
      setDimension(size);

      setInputs((prev) => ({
        vector: Array.from({ length: size }, (_, index) => ({
          value: prev.vector[index]?.value ?? "",
          error: "",
        })),
        matrix: Array.from({ length: size }, (_, rdx) =>
          Array.from({ length: size }, (_, cdx) => ({
            value: prev.matrix[rdx]?.[cdx]?.value ?? "",
            error: "",
          })),
        ),
      }));

      setX0((prev) =>
        Array.from({ length: size }, (_, index) => ({
          value: prev[index]?.value ?? "",
          error: "",
        })),
      );
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
          <NumberInput
            label="Size"
            max={5}
            min={2}
            size="md"
            value={dimension}
            onChange={(size) => resizer(Number(size))}
          />
          <Component
            x0={x0}
            dimension={dimension}
            inputs={inputs}
            onBlur={onBlur}
            onFocus={onFocus}
            onChange={onChange}
          />
          <Button mt={16} size="md" type="submit" onSubmit={onSubmit}>
            Calculate
          </Button>
        </Controller>
        {results.length > 1 ? (
          <>
            <Solution result={results} />
          </>
        ) : null}
      </>
    );
  };
}

export const Input = {
  Vector: ({
    inputs,
    onBlur,
    onFocus,
    onChange,
  }: {
    inputs: { value: string; error: string }[];
    onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus: (e: ChangeEvent<HTMLInputElement>) => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }) => {
    return (
      <Fieldset legend="B">
        <Stack gap={16}>
          {inputs.map((input, index) => (
            <TextInput
              key={index}
              name={`B${index}`}
              placeholder={`B${index}`}
              value={input.value}
              error={input.error}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          ))}
        </Stack>
      </Fieldset>
    );
  },

  Matrix: ({
    inputs,
    onBlur,
    onFocus,
    onChange,
  }: {
    inputs: { value: string; error: string }[][];
    onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus: (e: ChangeEvent<HTMLInputElement>) => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }) => {
    return (
      <Fieldset w="100%" legend="Ax">
        <Stack gap={16}>
          {inputs.map((row, rdx) => (
            <Flex gap={16} key={rdx}>
              {row.map((input, cdx) => (
                <TextInput
                  w="100%"
                  key={cdx}
                  name={`Ax${rdx}${cdx}`}
                  placeholder={`A${rdx}${cdx}`}
                  value={input.value}
                  error={input.error}
                  onChange={onChange}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              ))}
            </Flex>
          ))}
        </Stack>
      </Fieldset>
    );
  },
};

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

const Solution = ({ result }: { result: number[] }) => (
  <Card withBorder shadow="sm" padding="xl">
    <Stack align="center" gap={16}>
      <Text fz={24} fw={500}>
        Solution
      </Text>
      <Table horizontalSpacing="md" withColumnBorders verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              X<sub>i</sub>
            </Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {result.map((value, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                X<sub>{index}</sub>
              </Table.Td>
              <Table.Td>{value.toString()}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  </Card>
);
