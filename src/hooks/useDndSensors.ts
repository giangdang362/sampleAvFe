import {
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  SensorDescriptor,
} from "@dnd-kit/core";

export const useDndSensors = (
  ...sensors: (SensorDescriptor<any> | undefined | null)[]
) =>
  useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 400,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      keyboardCodes: {
        start: ["Space", "Enter"],
        cancel: ["Escape"],
        end: ["Space", "Enter"],
      },
    }),
    ...sensors,
  );
