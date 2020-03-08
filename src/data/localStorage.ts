import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { clearAppStateForLocalStorage } from "../appState";
import { restore } from "./restore";
import * as uuid from "uuid";

const LOCAL_STORAGE_KEY = "excalidraw";
const LOCAL_STORAGE_KEY_STATE = "excalidraw-state";
const SESSION_STORAGE_KEY_CLIENT_ID = "excalidraw-client_id";

export function getClientId() {
  const storedClientId = sessionStorage.getItem(SESSION_STORAGE_KEY_CLIENT_ID);
  if (storedClientId) {
    return storedClientId;
  }
  const newClientId = uuid.v4();
  sessionStorage.setItem(SESSION_STORAGE_KEY_CLIENT_ID, newClientId);
  return newClientId;
}

export function saveToLocalStorage(
  elements: readonly ExcalidrawElement[],
  appState: AppState,
) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(elements));
  localStorage.setItem(
    LOCAL_STORAGE_KEY_STATE,
    JSON.stringify(clearAppStateForLocalStorage(appState)),
  );
}

export function restoreFromLocalStorage() {
  const savedElements = localStorage.getItem(LOCAL_STORAGE_KEY);
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_STATE);

  let elements = [];
  if (savedElements) {
    try {
      elements = JSON.parse(savedElements);
    } catch {
      // Do nothing because elements array is already empty
    }
  }

  let appState = null;
  if (savedState) {
    try {
      appState = JSON.parse(savedState) as AppState;
      // If we're retrieving from local storage, we should not be collaborating
      appState.isCollaborating = false;
      appState.collaboratorCount = 0;
    } catch {
      // Do nothing because appState is already null
    }
  }

  return restore(elements, appState);
}
