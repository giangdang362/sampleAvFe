import { KeyboardEvent } from "react";
import {
  DraggableNode,
  KeyboardSensor,
  KeyboardSensorOptions,
} from "@dnd-kit/core";

// Only activate on key events that acting on only the current element, not the descendants
export class OnlySelfKeyboardSensor extends KeyboardSensor {
  static activators = [
    {
      eventName: "onKeyDown" as const,
      handler: (
        event: KeyboardEvent,
        options: KeyboardSensorOptions,
        context: {
          active: DraggableNode;
        },
      ) => {
        if (event.currentTarget !== event.target) return false;

        return KeyboardSensor.activators
          .flatMap((activator) =>
            activator.eventName === "onKeyDown"
              ? [activator.handler(event, options, context)]
              : [],
          )
          .some(Boolean);
      },
    },
  ];
}
