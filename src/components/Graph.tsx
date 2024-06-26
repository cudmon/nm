import { Card } from "@mantine/core";
import { useEffect, useRef } from "react";
import { plot, PlotOptions } from "@observablehq/plot";

type Props = {
  options: PlotOptions;
};

export function Graph({ options }: Readonly<Props>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view = plot(options);

    view.style.width = "100%";
    view.style.height = "100%";
    view.style.display = "block";
    view.style.fontSize = "10px";
    view.style.fontWeight = "500";
    view.style.fontFamily = "Jost, sans-serif";
    view.style.backgroundColor = "transparent";

    ref.current?.appendChild(view);

    return () => view.remove();
  }, [options]);

  return <Card ref={ref} shadow="sm" padding="xl" withBorder />;
}
