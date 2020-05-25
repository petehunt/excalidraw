import { KEYS } from "../keys";
import { register } from "./register";
import nanoid from "nanoid";
import { ExcalidrawElement, NonDeleted } from "../element/types";
import { newElementWith } from "../element/mutateElement";
import { getSelectedElements } from "../scene";
import { getSelectedGroupIds, selectGroup } from "../groups";

export const actionGroup = register({
  name: "group",
  perform: (elements, appState) => {
    const selectedElements = getSelectedElements(
      elements.filter((element) => !element.isDeleted) as NonDeleted<
        ExcalidrawElement
      >[],
      appState,
    );
    if (selectedElements.length < 2) {
      // nothing to group
      return { appState, elements, commitToHistory: false };
    }
    // if everything is already grouped into 1 group, there is nothing to do
    const selectedGroupIds = getSelectedGroupIds(appState);
    if (selectedGroupIds.length === 1) {
      const selectedGroupId = selectedGroupIds[0];
      const elementIdsInGroup = new Set(
        elements
          .filter((element) => element.groupIds.includes(selectedGroupId))
          .map((element) => element.id),
      );
      const selectedElementIds = new Set(
        selectedElements.map((element) => element.id),
      );
      const combinedSet = new Set([
        ...Array.from(elementIdsInGroup),
        ...Array.from(selectedElementIds),
      ]);
      if (combinedSet.size === elementIdsInGroup.size) {
        // no incremental ids in the selected ids
        return { appState, elements, commitToHistory: false };
      }
    }
    const newGroupId = nanoid();
    const updatedElements = elements.map((element) => {
      if (!appState.selectedElementIds[element.id]) {
        return element;
      }
      return newElementWith(element, {
        groupIds: [...element.groupIds, newGroupId],
      });
    });
    return {
      appState: selectGroup(newGroupId, appState, updatedElements),
      elements: updatedElements,
      commitToHistory: true,
    };
  },
  contextMenuOrder: 4,
  contextItemLabel: "labels.group",
  keyTest: (event) => {
    return (
      !event.shiftKey &&
      event[KEYS.CTRL_OR_CMD] &&
      event.altKey &&
      event.keyCode === 71
    );
  },
});

export const actionUngroup = register({
  name: "ungroup",
  perform: (elements, appState) => {
    const groupIds = getSelectedGroupIds(appState);
    if (groupIds.length === 0) {
      return { appState, elements, commitToHistory: false };
    }
    return {
      appState: { ...appState, selectedGroupIds: {} },
      elements: elements.map((element) => {
        const filteredGroupIds = element.groupIds.filter(
          (groupId) => !appState.selectedGroupIds[groupId],
        );
        if (filteredGroupIds.length === element.groupIds.length) {
          return element;
        }
        return newElementWith(element, {
          groupIds: filteredGroupIds,
        });
      }),
      commitToHistory: true,
    };
  },
  keyTest: (event) => {
    return (
      event.shiftKey &&
      event[KEYS.CTRL_OR_CMD] &&
      event.altKey &&
      event.keyCode === 71
    );
  },
  contextMenuOrder: 5,
  contextItemLabel: "labels.ungroup",
});
