import {
  ExcalidrawElement,
  MutableExcalidrawElement,
  ExcalidrawTextElement,
  MutableExcalidrawTextElement,
} from "./types";

export function mutateElement(
  element: ExcalidrawElement,
  cb: (element: MutableExcalidrawElement) => void,
) {
  const mutableElement = element as MutableExcalidrawElement;
  cb(mutableElement);
  mutableElement.version++;
}

export function mutateTextElement(
  element: ExcalidrawTextElement,
  cb: (element: MutableExcalidrawTextElement) => void,
) {
  const mutableElement = element as MutableExcalidrawTextElement;
  cb(mutableElement);
  mutableElement.version++;
}
